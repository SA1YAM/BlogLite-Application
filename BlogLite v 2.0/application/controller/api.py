import os
import sys

current = os.path.dirname(os.path.realpath(__file__))
#print(current)

parentt = os.path.dirname(current)
sys.path.append(parentt)
#print("parentt",parentt)

parent = os.path.dirname(parentt)
sys.path.append(parent)
#print("parent",parent)
 

from flask_restful import Api, Resource, abort, reqparse, marshal_with, fields, request
from flask import jsonify
from application.utils.security import user_datastore
from application.data.models import db, User, Role, Blog, Followmap, Like, Comment, Inbox, Message
from application.jobs.tasks import export_csv, send_report
from application.config import store_img
from main import app, cache
from email_validator import validate_email, EmailNotValidError
from datetime import datetime
from flask_security import auth_required, hash_password, current_user, verify_password


api = Api(app)


args_user = reqparse.RequestParser()
args_user.add_argument('username', type = str, required = True)
args_user.add_argument('Password', type = str, required = True)
args_user.add_argument('full_name', type = str, required = True)
args_user.add_argument('email', type = str, required = True)
args_user.add_argument('dob', type = str, required = True)



class ChangeFollowingFormat(fields.Raw):
    def format(self, value):
        return value.following_id
        
        
class ChangeDateFormat(fields.Raw):
    def format(self, value):
        return value.strftime('%d/%m/%Y %H:%M')
        

        
user_fields = {
    "id" : fields.Integer,
    "username" : fields.String,
    "email" : fields.String,
    "profile_photo": fields.String,
    "following": fields.List(ChangeFollowingFormat),
    "dob": ChangeDateFormat,
    "report_format": fields.String,
    "errors": fields.List(fields.String),
}


def check_email(email):

    try:
      # validate and get info
        validation = validate_email(email, check_deliverability = True)
        # replace with normalized form
#        print(validation.email)
        validity = True
        
    except EmailNotValidError as e:
        # email is not valid, exception message is human-readable
#        print(str(e))
        validity = False
        
    return validity


class Users(Resource):


    @marshal_with(user_fields)
    def post(self):
        args = args_user.parse_args()
        
        
        errors_list = []
        
#        print(args["username"], type(args["username"]))
        
        if args["username"]:
            if user_datastore.find_user(username = args["username"]):
                errors_list.append("username already exists please choose a diffrent one")
                    
            if len(args["username"]) > 30:
                errors_list.append("username should be less than 20 characters")  
                
            if " " in args["username"] :
                errors_list.append("username should not contain any spaces") 
               
               
        else:
            errors_list.append("username can not be empty")
            
            
        if args["email"]:
            if user_datastore.find_user(email = args["email"]):
                errors_list.append("email already exists please choose a diffrent one")
                
            if not check_email(args["email"]):
                errors_list.append("Please choose a valid email")
                
        else:
            errors_list.append("email can not be empty")
              
            
        if args["dob"]:
            if datetime.strptime(args["dob"], '%Y-%m-%d') < datetime.now():
                sssdob = 5
#                print(args["dob"])
                 
            else:
                errors_list.append("please choose a valid dob") 
                
        else:
            errors_list.append("Date of birth can not be empty")
            
            
        if args["full_name"]:
            if len(args["full_name"]) > 40:
                errors_list.append("full name should be less than 50 characters") 
            
            if len(args["full_name"].strip()) == 0:
                errors_list.append("Full Name cannot contain only whitespaces")
                
        else:
            errors_list.append("full name can not be empty")
            
        if args["Password"]:
            if len(args["Password"]) < 5:
                errors_list.append("password should contain atleast 5 characters") 
                
            if " " in args["Password"] :
                errors_list.append("password should not contain any spaces") 
                
        else:
            errors_list.append("password can not be empty")
            
        if len(errors_list) > 0:
#            print(errors_list)
            error = {}
            error["errors"] = errors_list
            
            return error, 409

        
        user = user_datastore.create_user(
            username = args["username"],
            password = hash_password(args["Password"]),
            full_name = args["full_name"],
            email = args["email"],
            created_at = datetime.now(),
            dob = datetime.strptime(args["dob"], '%Y-%m-%d'),
            report_format = "html"
        )
        
        db.session.commit()
        
#        print(user)
        
        if not user_datastore.find_role("Admin"):
            user_datastore.create_role(name="Admin", description="Admin Related Role")
            db.session.commit()
            
        cache.clear()
                
        return user, 201
        
      
    
    @auth_required('token')
#    @marshal_with(user_fields)
    def delete(self):
        if current_user.is_authenticated:
    
            args = args_user.parse_args()
            
            errors_list = []
            
            if args["username"] != current_user.username:
                errors_list.append("username does not match")
                
            if args["email"] != current_user.email:
                errors_list.append("email does not match")    
            
            if args["full_name"] != current_user.full_name:
                errors_list.append("Full name does not match") 
                
            if not verify_password(args["Password"], current_user.password):
                errors_list.append("Password does not match") 
#                print("does not match pass")
            
            if args["dob"]:
                if datetime.strptime(args["dob"], '%Y-%m-%d') != current_user.dob:
                    errors_list.append("Date of birth does not match")   
            else:
                errors_list.append("Date of birth does not match") 
                
            if len(errors_list) > 0:
#                print(errors_list)
                error = {}
                error["errors"] = errors_list
                
                return error, 200
                
            followmaps1 = Followmap.query.filter_by(follower_id = current_user.id).all()   
            followmaps2 = Followmap.query.filter_by(following_id = current_user.id).all()  
            followmaps = followmaps1 + followmaps2
            
            for fmap in followmaps:
                db.session.delete(fmap)
                db.session.commit()
                
            cache.clear()
            
            
            user = User.query.get(current_user.id)
            user_datastore.delete_user(user)
            db.session.commit()
#            print("deleted")
            return 200
        
        
        
    @auth_required('token')
    @cache.cached(timeout=10)
    @marshal_with(user_fields)
    def get(self):
        if current_user.is_authenticated:
            return current_user, 200
        
        
         
api.add_resource(Users, "/api/user")
        
        
class ChangeLikeFormat(fields.Raw):
    def format(self, value):
        return value.like_username
        

like_fields = {
    "like_id" : fields.Integer,
    "like_username" : fields.String,
    "post_id": fields.Integer,
}

comment_fields = {
    "comment_id" : fields.Integer,
    "comment_username" : fields.String,
    "content" : fields.String,
    "post_id": fields.Integer,
}


post_fields1 = {
    "post_id" : fields.Integer,
    "username": fields.String,
    "title" : fields.String,
    "caption" : fields.String,
    "image_url": fields.String,
    "time_stamp" : ChangeDateFormat,
    "archive_switch" : fields.Boolean,
    "updated" : fields.Boolean,
    "user_id" : fields.Integer,
}

post_fields = {
    "post_id" : fields.Integer,
    "username": fields.String,
    "title" : fields.String,
    "caption" : fields.String,
    "image_url": fields.String,
    "time_stamp" : ChangeDateFormat,
    "archive_switch" : fields.Boolean,
    "user_id" : fields.Integer,
    "likes" : fields.List(ChangeLikeFormat),
    "comments" : fields.List(fields.Nested(comment_fields)),
}


  

class Dashboards(Resource):
    @auth_required('token')
    @cache.cached(timeout=10)
    @marshal_with(post_fields)
    def get(self):
        if current_user.is_authenticated:
            user = User.query.get(current_user.id)
            user.last_login_at = datetime.now()
            db.session.commit()
            
            feed = []
            
#            print(current_user.following)
            
            for person in current_user.following:
                person_id = person.following_id
                person = User.query.get(person_id)
                for post in person.posts:
                    if not post.archive_switch:
                        feed.append(post)
                    
            post_feed = sorted(feed, key = lambda post: post.time_stamp, reverse = True)   
            
            if post_feed == []:
#                print("there are no posts")
                return {} 
                
            else:   
#                print (post_feed)
                return post_feed, 200     
    

api.add_resource(Dashboards, "/api/dashboard")
        
        

user_fields1 = {
    "id" : fields.Integer,
    "username" : fields.String,
    "profile_photo": fields.String,
    "following": fields.Integer,
    "posts": fields.List(fields.Nested(post_fields1)),
    "followers": fields.Integer,
    "total_posts": fields.Integer,
    "report_format": fields.String,
}




class MyProfile(Resource):

    @auth_required('token')
    @cache.cached(timeout=10)
    @marshal_with(user_fields1)
    def get(self):
        if current_user.is_authenticated:
        
            user = {}
            user["id"] = current_user.id
            user["username"] = current_user.username
            user["profile_photo"] = current_user.profile_photo
            user["following"] = len(current_user.following)
            user["posts"] = sorted(current_user.posts, key = lambda post: post.time_stamp, reverse = True) 
            user["total_posts"] = len(current_user.posts)
            
            followers = Followmap.query.filter_by(following_id = current_user.id).all()
            
            user["followers"] = len(followers)
            user["report_format"] = current_user.report_format
            
#            print(user)
            
            return user, 200
                
api.add_resource(MyProfile, '/api/myprofile')



class ChangePostsFormat(fields.Raw):
    def format(self, value):
        return value.title
        
        
mypost_fields = {
    "posts": fields.List(ChangePostsFormat),
}
        

class MyPosts(Resource):

    @auth_required('token')
    @cache.cached(timeout=10)
    @marshal_with(mypost_fields)
    def get(self):
        if current_user.is_authenticated:
        
            return current_user, 200
                
api.add_resource(MyPosts, '/api/myposts')





class OtherProfile(Resource):

    @auth_required('token')
    @cache.memoize(timeout=10)
    @marshal_with(user_fields1)
    def get(self, user_name):
        if current_user.is_authenticated:
        
            other_user = User.query.filter_by(username = user_name).first()
            
            if other_user:
        
                user = {}
                user["id"] = other_user.id
                user["username"] = other_user.username
                user["profile_photo"] = other_user.profile_photo
                user["following"] = len(other_user.following)
                user["posts"] = other_user.posts
                user["total_posts"] = len(other_user.posts)
                
                followers = Followmap.query.filter_by(following_id = other_user.id).all()
                
                user["followers"] = len(followers)
            
                return user, 200
#            print(user)
            
            else:
                return {}, 200
            
                
api.add_resource(OtherProfile, '/api/otherprofile/<user_name>')






class Post(Resource):

    @auth_required('token')
    @cache.memoize(timeout=10)
    @marshal_with(post_fields)
    def get(self, post_id):
        if current_user.is_authenticated:
            post = Blog.query.get(post_id)
            
#            print(post)
            return post
   
   
                
                
    @auth_required('token')
    @marshal_with(post_fields)
    def post(self):
    
        if current_user.is_authenticated:
            listss = current_user.posts
            
            file = request.files['file']
#            print(file, request.form, request.form.get("title"))
            
        
            filename = current_user.username + "_" + request.form.get("title") + "_" + file.filename
            
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

#            print(request.form.get("image_url"))
            Title = request.form.get("title")
            Caption = request.form.get("caption")
            Created_Date = datetime.now()
            ArchiveSwitch = True
#            print(request.form.get("archive_switch"),type(request.form.get("archive_switch")))
            
            if request.form.get("archive_switch") == "false":
                ArchiveSwitch = False
                
            cache.clear()
            
            b1 = Blog(title = Title, caption = Caption, time_stamp = Created_Date, user_id = current_user.id, username = current_user.username, image_url = filename, archive_switch = ArchiveSwitch, updated = False)
            db.session.add(b1)
            db.session.commit()
            return b1,  201
                                
                
                
    @auth_required('token')
    @marshal_with(post_fields)
    def put(self, post_id):
    
        if current_user.is_authenticated:
            
            if(request.form.get("present") == "true"):
                file = request.files['file']
#                print(file, request.form, request.form.get("title"))
                filename = current_user.username + "_" + request.form.get("title") + "_" + file.filename
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

            else:
                filename = request.form.get("image_url")
                
#            print(request.form.get("image_url"))
            Title = request.form.get("title")
            Caption = request.form.get("caption")
            Created_Date = datetime.now()
            ArchiveSwitch = True
#            print(request.form.get("archive_switch"),type(request.form.get("archive_switch")))
            
            if(request.form.get("archive_switch") == "false"):
                ArchiveSwitch = False
            
            flag = True
            

            if len(Title) > 20:
                message = "Your card title should be only of 20 characters at max."
                flag = False
                raise Exception(message)
                
            cache.clear()
                

            if (flag):
                blog = Blog.query.get(post_id)
                blog.title = Title 
                blog.caption = Caption 
                blog.time_stamp = Created_Date 
                blog.image_url = filename
                blog.archive_switch = ArchiveSwitch
                blog.updated = True
                
                db.session.commit()
                
                return blog,  200

            else:
                message = "Choose a diffrent card name, the card from that name already exists in the list. Card name should not be same within a list"
                raise Exception(message)   
                
                
    
    @auth_required('token')
#    @marshal_with(post_fields)
    def delete(self, post_id):
        if current_user.is_authenticated:
            blog = Blog.query.get(post_id)
            db.session.delete(blog)
            db.session.commit()
            
            cache.clear()
            
            
            return 200 

api.add_resource(Post, "/api/post", "/api/post/<int:post_id>")


search_fields = {
    "id" : fields.Integer,
    "username" : fields.String,
    "following" : fields.Boolean,
}


class Connect(Resource):

    @auth_required('token')
    @cache.cached(timeout = 10)
    @marshal_with(search_fields)
    def get(self):
        if current_user.is_authenticated:
#            value = request.args.get("value")
#            print(value)
            
            users_list = User.query.all()
#            print(users_list)
            users = users_list.copy()
            user = User.query.get(current_user.id)
            users.remove(user)
            
#            print(users)
            return users, 200
             
             
    @auth_required('token')
    @marshal_with(search_fields)
    def post(self, user_id):
        if current_user.is_authenticated:
            user = User.query.get(user_id)
#            print(user)
            
            c = Followmap.query.filter_by(follower_id = current_user.id, following_id = user_id).first()
            
            if c:
                abort(409, description="User already follows that user.")
                
            c1 = Followmap(follower_id = current_user.id, following_id = user_id)
            
            if user.notifications:
                note = current_user.username + " has started following you"
                user.notifications = user.notifications + "," + note
                
            else:
                note = current_user.username + " has started following you"
                user.notifications = note
                
                
            db.session.add(c1)
            db.session.commit()
            
            cache.clear()
                
            return user, 201
            
            
    @auth_required('token')
#    @marshal_with(search_fields)
    def delete(self, user_id):
        if current_user.is_authenticated:
            user = User.query.get(user_id)
#            print(user)
            
            c = Followmap.query.filter_by(follower_id = current_user.id, following_id = user_id).first()
            
            if c in current_user.following:
                if user.notifications:
                    note = current_user.username + " has unfollowed you"
                    user.notifications = user.notifications + "," + note
                
                else:
                    note = current_user.username + " has unfollowed you"
                    user.notifications = note
                db.session.delete(c)
                db.session.commit()
                
            cache.clear()
                
            return 200
        

          
api.add_resource(Connect, '/api/connect', '/api/connect/<int:user_id>')



class ProfilePhoto(Resource):
        
    @auth_required('token')
    @marshal_with(user_fields)
    def post(self):
    
        if current_user.is_authenticated:
#            print(current_user.profile_photo)
            
            file = request.files['file']
        
            filename = current_user.username + "_" + file.filename
            
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

            user = User.query.get(current_user.id)
            user.profile_photo = filename
            db.session.commit()
            
            cache.clear()
            
#            print(current_user.profile_photo)  
            return current_user, 201
            
    
    @auth_required('token')
    @marshal_with(user_fields)
    def put(self):
    
        if current_user.is_authenticated:
            
            file = request.files['file']
        
            filename = current_user.username + "_" + file.filename
            
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

            user = User.query.get(current_user.id)
            user.profile_photo = filename
            db.session.commit()
            
            cache.clear()
            
#            print(current_user.profile_photo) 
            return current_user, 200
            
            
    @auth_required('token')
    @marshal_with(user_fields)
    def delete(self):
    
        if current_user.is_authenticated:

            user = User.query.get(current_user.id)
            user.profile_photo = None
            db.session.commit()
            
            cache.clear()
            
#            print(current_user.profile_photo) 
            return current_user, 200


api.add_resource(ProfilePhoto, "/api/profilePhoto")



        
        
inbox_fields = {
    "user_id": fields.Integer,
    "username": fields.String,
    "inbox_id": fields.Integer,
}


class Inboxs(Resource):

    @auth_required('token')
    @cache.cached(timeout = 10)
    @marshal_with(inbox_fields)
    def get(self):
        if current_user.is_authenticated:
            
            users = []
            inbox_list1 = Inbox.query.filter_by(sender_id = current_user.id).all()
            
            for inbox in inbox_list1:
                user = {}
                user["user_id"] = inbox.reciever_id
                user["username"] = inbox.reciever_username
                user["inbox_id"] = inbox.inbox_id
                users.append(user)
                
#            print(users)
            
            inbox_list2 = Inbox.query.filter_by(reciever_id = current_user.id).all()
#            print(users)
            
            for inbox in inbox_list2:
                user = {}
                user["user_id"] = inbox.sender_id
                user["username"] = inbox.sender_username
                user["inbox_id"] = inbox.inbox_id
                users.append(user)      

#            print(users)
            
            return users, 200
                
             
             
    @auth_required('token')
    @marshal_with(inbox_fields)
    def post(self, user_id):
        if current_user.is_authenticated:
        
            user = User.query.get(user_id)
            
            
            if (current_user.id < user_id):
                senderr_id = current_user.id
                senderr_name = current_user.username
                recieverr_id = user_id
                recieverr_name = user.username
                
            else:
                senderr_id = user_id
                senderr_name = user.username
                recieverr_id = current_user.id
                recieverr_name = current_user.username
                
            
            inbox = Inbox.query.filter_by(sender_id = senderr_id, reciever_id = recieverr_id).first()
            
#            print(inbox)
            
            users = {}
            users["user_id"] = user_id
            users["username"] = user.username
            
            
#            print(users)
            
            if inbox:
                users["inbox_id"] = inbox.inbox_id
                return users, 200
                
            
            else:
                inbox1 = Inbox(sender_id = senderr_id, sender_username = senderr_name, reciever_id = recieverr_id, reciever_username = recieverr_name, blocked = False)
                db.session.add(inbox1)
                db.session.commit()
                
                inbox2 = Inbox.query.filter_by(sender_id = senderr_id, reciever_id = recieverr_id).first()
                
                users["inbox_id"] = inbox2.inbox_id
#                print(users)
                
                cache.clear()
                
                return users, 201
        
        
api.add_resource(Inboxs, '/api/inbox', '/api/inbox/<int:user_id>')


class ChangeDateMessage(fields.Raw):
    def format(self, value):
#        print(value.strftime('%d/%m/%Y %H:%M'))
        return value.strftime('%d/%m/%Y %H:%M')
        

message_fields = {
    "inbox_id": fields.Integer,
    "message": fields.String,
    "sent": fields.Boolean,
    "time_stamp": ChangeDateMessage,
    "errors": fields.String,
}



args_message = reqparse.RequestParser()
args_message.add_argument('message', type = str, required = True)
args_message.add_argument('inbox_id', type = int, required = True)


    
class Messages(Resource):

    @auth_required('token')
    @cache.memoize(timeout = 10)
    @marshal_with(message_fields)
    def get(self, inbox_id):
    
        if current_user.is_authenticated:
#            print(inbox_id)
            
            inbox = Inbox.query.get(inbox_id)      
            
            if (inbox.reciever_id == current_user.id):
                messages = inbox.messages.copy()
                
                for message in messages:
                    message.sent = not message.sent
                    
                return messages, 200
                
            else:
                return inbox.messages, 200            
             
             
    @auth_required('token')
    @marshal_with(message_fields)
    def post(self):
    
        if current_user.is_authenticated:
        
            args = args_message.parse_args()
            
#            print(args["inbox_id"], args["message"])
        
            inbox = Inbox.query.get(args["inbox_id"]) 
            
            if inbox.sender_id == current_user.id:
                sentt = True
                user = User.query.get(inbox.reciever_id)
                
            else:
                sentt = False
                user = User.query.get(inbox.sender_id)
            
            inboxx_id = inbox.inbox_id
            
            cache.clear()
            
            if user:
            
                if user.notifications:
                    note = current_user.username + " has messaged you"
                    user.notifications = user.notifications + "," + note
                    
                else:
                    note = current_user.username + " has messaged you"
                    user.notifications = note
                
                m = Message(message = args["message"], sent = sentt, time_stamp = datetime.now(), inbox_id = inboxx_id)
                db.session.add(m)
                db.session.commit()
                
                cache.clear()
                
                if (inbox.reciever_id == current_user.id):
                    messages = inbox.messages.copy()
                
                    for message in messages:
                        message.sent = not message.sent
                        
                    return messages, 201
                    
                else:
                    return inbox.messages, 201
                
            else:
                error = {}
                error["errors"] = "User has deleted their account you cannot send messages now."
                return error, 405
        

          
api.add_resource(Messages, '/api/message', '/api/message/<int:inbox_id>')


follower_fields = {
    "id": fields.Integer,
    "username": fields.String,
}


class Followers(Resource):

    @auth_required('token')
    @cache.cached(timeout = 10)
    @marshal_with(follower_fields)
    def get(self):
        if current_user.is_authenticated:
            
            map_list = Followmap.query.filter_by(following_id = current_user.id).all()
            
            users = []
            for mapp in map_list:
                user = User.query.get(mapp.follower_id)
                users.append(user)
            
            
#            print(users)
            return users, 200
                 

          
api.add_resource(Followers, '/api/followers')


class OtherFollowers(Resource):

    @auth_required('token')
    @cache.memoize(timeout = 50)
    @marshal_with(follower_fields)
    def get(self, user_id):
        if current_user.is_authenticated:
            
            map_list = Followmap.query.filter_by(following_id = user_id).all()
            
            users = []
            for mapp in map_list:
                user = User.query.get(mapp.follower_id)
                users.append(user)
            
            
#            print(users)
            return users, 200
                 

          
api.add_resource(OtherFollowers, '/api/otherFollowers/<int:user_id>')


class Following(Resource):

    @auth_required('token')
    @cache.cached(timeout = 10)
    @marshal_with(follower_fields)
    def get(self):
        if current_user.is_authenticated:
            
            users = []
            for mapp in current_user.following:
                user = User.query.get(mapp.following_id)
                users.append(user)
            
#            print(users)
            return users, 200
                        
api.add_resource(Following, '/api/following')


class OtherFollowing(Resource):

    @auth_required('token')
    @cache.memoize(timeout = 10)
    @marshal_with(follower_fields)
    def get(self, user_id):
        if current_user.is_authenticated:
            
            other_user = User.query.get(user_id)
            users = []
            for mapp in other_user.following:
                user = User.query.get(mapp.following_id)
                users.append(user)
            
#            print(users)
            return users, 200
                        
api.add_resource(OtherFollowing, '/api/otherFollowing/<int:user_id>')


class Likes(Resource):

    @auth_required('token')
    @marshal_with(post_fields)
    def post(self, postId):
        if current_user.is_authenticated:
        
            blog = Blog.query.get(postId)
            user = User.query.get(blog.user_id)
            
            if blog.user_id != current_user.id:
                if user.notifications:
                    note = current_user.username + " has liked post having title " + blog.title
                    user.notifications = user.notifications + "," + note
                
                else:
                    note = current_user.username + " has liked your post having title " + blog.title
                    user.notifications = note
            
            like = Like(like_username = current_user.username, post_id = postId )
            db.session.add(like)
            db.session.commit()
            
            feed = []
            
#            print(current_user.following)
            
            for person in current_user.following:
                person_id = person.following_id
                person = User.query.get(person_id)
                for post in person.posts:
                    if not post.archive_switch:
                        feed.append(post)
                    
            
            post_feed = sorted(feed, key = lambda post: post.time_stamp, reverse = True)  
            
            cache.clear()    
            
            if post_feed == []:
#                print("there are no posts")
                return {} 
                
            else:   
#                print (post_feed)
                return post_feed, 201 
            
            
    @auth_required('token')
    @marshal_with(post_fields)
    def delete(self, postId):
        if current_user.is_authenticated:
        
            blog = Blog.query.get(postId)
            user = User.query.get(blog.user_id)
            
            
            if blog.user_id != current_user.id:
                if user.notifications:
                        note = current_user.username + " has Unliked post having title " + blog.title
                        user.notifications = user.notifications + "," + note
                    
                else:
                    note = current_user.username + " has Unliked your post having title " + blog.title
                    user.notifications = note
                
                like = Like.query.filter_by(like_username = current_user.username, post_id = postId ).first()
                db.session.delete(like)
                db.session.commit()
            
            
            feed = []
            
#            print(current_user.following)
            
            for person in current_user.following:
                person_id = person.following_id
                person = User.query.get(person_id)
                for post in person.posts:
                    if not post.archive_switch:
                        feed.append(post)
                        
            post_feed = sorted(feed, key = lambda post: post.time_stamp, reverse = True)  
                    
            cache.clear()   
            
            if post_feed == []:
#                print("there are no posts")
                return {} 
                
            else:   
#                print (post_feed)
                return post_feed, 200 
            
api.add_resource(Likes, '/api/like/<int:postId>')            
 

args_comment = reqparse.RequestParser()
args_comment.add_argument('comment', type = str, required = True)
  

class Comments(Resource):

    @auth_required('token')
    @marshal_with(post_fields)
    def post(self, postId):
        if current_user.is_authenticated:
            
            args = args_comment.parse_args()
            
            blog = Blog.query.get(postId)
            user = User.query.get(blog.user_id)
            
            if blog.user_id != current_user.id:
                if user.notifications:
                        note = current_user.username + " has commented on your post having title " + blog.title
                        user.notifications = user.notifications + "," + note
                    
                else:
                    note = current_user.username + " has commented on your post having title " + blog.title
                    user.notifications = note
            
            
            comment = Comment(comment_username = current_user.username, post_id = postId, content = args["comment"] )
            db.session.add(comment)
            db.session.commit()
            
            
            feed = []
            
#            print(current_user.following)
            
            for person in current_user.following:
                person_id = person.following_id
                person = User.query.get(person_id)
                for post in person.posts:
                    if not post.archive_switch:
                        feed.append(post)
                        
                        
            post_feed = sorted(feed, key = lambda post: post.time_stamp, reverse = True) 
                    
            cache.clear()    
            
            if post_feed == []:
#                print("there are no posts")
                return {} 
                
            else:   
#                print (post_feed)
                return post_feed, 200 
                
            
api.add_resource(Comments, '/api/comment/<int:postId>')      


notification_fields = {
    "notifications": fields.String,
}

class Notifications(Resource):

    @auth_required('token')
    @cache.cached(timeout = 10)
    @marshal_with(notification_fields)
    def get(self):
        if current_user.is_authenticated:
            
#            print(current_user.notifications)
            
            return current_user, 200
            
    @auth_required('token')
    @marshal_with(notification_fields)
    def delete(self):
        if current_user.is_authenticated:
            
            user = User.query.get(current_user.id)
            user.notifications = None
            db.session.commit()
            
#            print(current_user.notifications)
            
            cache.clear() 
            
            return current_user, 200
            
            
                        
api.add_resource(Notifications, '/api/notifications')
            

export_fields = {
    "message": fields.String,
}
    
class Exportcsv(Resource):

    @auth_required('token')
    @cache.cached(timeout = 10)
    @marshal_with(export_fields)
    def get(self):
        if current_user.is_authenticated:
            
            res = export_csv.delay(current_user.id)
#            print(res, res.ready())
            
            
            return {"message": "Export request sent. a zip file will be mailed to your email"}, 200
            
            
                        
api.add_resource(Exportcsv, '/api/export')
            

            
 
args_report = reqparse.RequestParser()
args_report.add_argument('report_format', type = str, required = True)

            
class ReportFormat(Resource):

    @auth_required('token')
    @marshal_with(user_fields)
    def put(self):
        if current_user.is_authenticated:
        
            args = args_report.parse_args()
            
#            print(args["report_format"])
            
            if args["report_format"] != current_user.report_format:
            
                user = User.query.get(current_user.id)
                user.report_format = args["report_format"]
                db.session.commit()
                
            cache.clear()
            
            return current_user, 200
            
            
                        
api.add_resource(ReportFormat, '/api/reportFormat')