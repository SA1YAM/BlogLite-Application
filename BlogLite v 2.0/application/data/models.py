import os
import sys

current = os.path.dirname(os.path.realpath(__file__))
#print(current)

parentt = os.path.dirname(current)
#print(parentt)

parent = os.path.dirname(parentt)
#print(parent)

sys.path.append(parent)
sys.path.append(parentt)



from flask_sqlalchemy import SQLAlchemy 
#from data.database import db
from flask_security import UserMixin, RoleMixin


db = SQLAlchemy()


roles_users = db.Table('roles_users',
        db.Column('user_id', db.Integer(), db.ForeignKey('user.id')),
        db.Column('role_id', db.Integer(), db.ForeignKey('role.id')))   
        

class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer(), primary_key = True, autoincrement = True)
    username = db.Column(db.String(20), unique = True, nullable = False)
    password = db.Column(db.String(), nullable = False)
    full_name = db.Column(db.String(30), nullable = False)
    email = db.Column(db.String(), unique = True, nullable = False)
    created_at = db.Column(db.DateTime(), nullable = False)
    dob = db.Column(db.DateTime(), nullable = False)
    profile_photo = db.Column(db.String())
    notifications = db.Column(db.String())
    last_login_at = db.Column(db.DateTime())
    report_format = db.Column(db.String(), nullable = False)
    active = db.Column(db.Boolean())
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False) 
    roles = db.relationship('Role', secondary=roles_users, backref=db.backref('users', lazy='dynamic'))
    posts = db.relationship('Blog', backref = 'user', cascade = "all, delete", lazy = True, foreign_keys = "Blog.user_id")
    following = db.relationship('Followmap', backref = 'user', cascade = "all, delete", lazy = True, foreign_keys = "Followmap.follower_id")
    

class Role(db.Model, RoleMixin):
    __tablename__ = 'role'
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(), unique=True)
    description = db.Column(db.String())
    
    
class Blog(db.Model):
    __tablename__ = 'blog'
    post_id = db.Column(db.Integer(), primary_key = True, autoincrement = True)
    title = db.Column(db.String(), nullable = False)
    caption = db.Column(db.String(), nullable = False)
    image_url = db.Column(db.String(), nullable = False)
    time_stamp = db.Column(db.DateTime(), nullable = False)
    user_id = db.Column(db.Integer(), db.ForeignKey('user.id'), nullable = False)
    username = db.Column(db.String(), db.ForeignKey('user.username'), nullable = False)
    archive_switch = db.Column(db.Boolean(), nullable = False)
    updated = db.Column(db.Boolean(), nullable = False)
    likes = db.relationship('Like', backref = 'blog', cascade = "all, delete", lazy = True, foreign_keys = "Like.post_id")
    comments = db.relationship('Comment', backref = 'blog', cascade = "all, delete", lazy = True, foreign_keys = "Comment.post_id")

    
class Followmap(db.Model):
    __tablename__ = 'followmap'
    map_id = db.Column(db.Integer(), primary_key = True, autoincrement = True)
    follower_id = db.Column(db.Integer(), db.ForeignKey('user.id'), nullable = False)
    following_id = db.Column(db.Integer(), db.ForeignKey('user.id'), nullable = False)
    
 
class Like(db.Model):
    __tablename__ = 'like'
    like_id = db.Column(db.Integer(), primary_key = True, autoincrement = True)
    like_username = db.Column(db.String(), db.ForeignKey('user.id'), nullable = False)
    post_id = db.Column(db.Integer(), db.ForeignKey('blog.post_id'), nullable = False)
 
 
class Comment(db.Model):
    __tablename__ = 'comment'
    comment_id = db.Column(db.Integer(), primary_key = True, autoincrement = True)
    comment_username = db.Column(db.String(), db.ForeignKey('user.username'), nullable = False)
    post_id = db.Column(db.Integer(), db.ForeignKey('blog.post_id'), nullable = False) 
    content = db.Column(db.String(), nullable = False)
    
class Inbox(db.Model):
    __tablename__ = 'inbox'
    inbox_id = db.Column(db.Integer(), primary_key = True, autoincrement = True)
    sender_id = db.Column(db.Integer(), db.ForeignKey('user.id'), nullable = False)
    sender_username = db.Column(db.String(), db.ForeignKey('user.username'), nullable = False)
    reciever_id = db.Column(db.Integer(), db.ForeignKey('user.id'), nullable = False)
    reciever_username = db.Column(db.String(), db.ForeignKey('user.username'), nullable = False)
    blocked = db.Column(db.Boolean(), nullable = False)
    messages = db.relationship('Message', backref = 'inbox', cascade = "all, delete", lazy = True)
    
class Message(db.Model):
    __tablename__ = 'message'
    message_id = db.Column(db.Integer(), primary_key = True, autoincrement = True)
    message = db.Column(db.String(), nullable = False)
    sent = db.Column(db.Boolean(), nullable = False)
    time_stamp = db.Column(db.DateTime(), nullable = False)
    inbox_id = db.Column(db.Integer(), db.ForeignKey('inbox.inbox_id'), nullable = False)   