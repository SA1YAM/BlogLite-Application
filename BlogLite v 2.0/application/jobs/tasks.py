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


from main import celery, mail, app
from flask_mail import Message
from flask import render_template, url_for
from application.data.models import db, User, Blog, Followmap, Inbox
from datetime import datetime, timedelta
import csv
import io
import zipfile
from celery.schedules import crontab
from weasyprint import HTML



def generate_csv(posts):
    field_names= ["Post_Id", "Title", "caption", "Timestamp", "Image_Url", "Archive_Switch", "Total_Likes", "Total_Comments"]
    data = []
    for post in posts:
#        print(len(post.likes))
        row = {"Post_Id": post.post_id, "Title": post.title, "caption": post.caption, "Timestamp": post.time_stamp.strftime('%d/%m/%Y %H:%M'), "Image_Url": post.image_url, "Archive_Switch": post.archive_switch , "Total_Likes": len(post.likes), "Total_Comments": len(post.comments) }
        data.append(row)
        
    file_output = io.StringIO()
    
    
    writer = csv.DictWriter(file_output, fieldnames=field_names)
    writer.writeheader()
    writer.writerows(data)
        
    file_output.seek(0)
    return file_output
        
    

@celery.task
def export_csv(user_id):

    current_user = User.query.get(user_id)
    
    csv_file = generate_csv(current_user.posts)
    
    zip_file = io.BytesIO()
    with zipfile.ZipFile(zip_file, 'w') as z:
        z.writestr('posts.csv', csv_file.read())
        path = parent + "/static/Images/"
        for post in current_user.posts:
            image = ""
            image = path + post.image_url
            z.write(image, post.image_url)
            
    zip_file.seek(0)
    
    msg = Message(recipients=[current_user.email],
                  body = "Hey " + current_user.username +  ", Please find your attached csv file inside posts.zip file.",
                  subject = "Exported zip file")
                  
    msg.attach("posts.zip", "application/zip", zip_file.read())
    
    mail.send(msg)
#    print("sent")
    
    

@celery.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):

    # Executes everyday evening at 8:00 p.m.
    sender.add_periodic_task(
        crontab(minute = 0, hour = 20),
        send_alert.s(),
        name = "daily reminder"
    )
    
    # Executes 1st day of every month at 5:00 p.m.
    sender.add_periodic_task(
        crontab(minute = 0, hour = 17, day_of_month = 1),
        send_report.s(),
        name = "monthly report"
    )


    
    
    
            
    
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
   
    
def generate_html(userr):
    user = {}
    last_month = datetime.now() - timedelta(days = 30)
    user["username"] = userr.username
#    user["following"] = 3
    user["following"] = len(userr.following)
    user["total_posts"] = len(userr.posts)
    user["posts"] = []
    user["interaction"] = 0
    followers = Followmap.query.filter_by(following_id = userr.id).all()
    user["followers"] = len(followers)
#    user["followers"] = 2
    
    
    for post in userr.posts:
        if post.time_stamp > last_month:
            user["posts"].append(post)
            
    user["posts"] = sorted(user["posts"], key = lambda post: post.time_stamp) 
        
    user["lmonth_posts"] = len(user["posts"])
        
    inbox_list1 = Inbox.query.filter_by(sender_id = userr.id)
    inbox_list2 = Inbox.query.filter_by(reciever_id = userr.id)
    
    for inbox in inbox_list1:
        message = inbox.messages[-1]
        if message.time_stamp > last_month:
            user["interaction"] += 1
            
    for inbox in inbox_list1:
        message = inbox.messages[-1]
        if message.time_stamp > last_month:
            user["interaction"] += 1
            
    followers = 0
    following = 0
    labels = "Followers", "Following"
    user["img_pie"] = False
    user["img_bar"] = False
    
    path = parent + "/static/Images/"
    
    if (user["followers"] + user["following"]) > 0:
        user["img_pie"] = True
    
        followers = user["followers"] * 100/ (user["followers"] + user["following"])
        following = user["following"] * 100/ (user["followers"] + user["following"])
        labels = "Followers(%)", "Following(%)"
        sizes = [followers, following]
        
        plt.pie(sizes, labels=labels, autopct='%1.1f%%')
        
        pie_name = "engagement_pie_" + user["username"] + ".png"

        plt.savefig(path + pie_name)
        
    plt.clf()
    
    
    
    titles = []
    likes = []
    comments = []
    
    for postt in user["posts"]:
        titles.append(postt.title)
        likes.append(len(postt.likes))
        comments.append(len(postt.comments))
        if len(postt.likes) > 0 or len(postt.comments) > 0:
            user["img_bar"] = True
            
    
    if user["img_bar"]:
        width = 0.4
        x = np.arange(len(titles))
        plt.bar(x-0.2, likes, width) 
        plt.bar(x+0.2, comments, width) 
        plt.xlabel('Blog Title')
        plt.ylabel('Total Likes/Comments')
        plt.title('Likes & Comments recieved for blogs')
        plt.legend(["Likes", "Comments"])
        
        mini = 0
        maxi1 = max(likes) 
        maxi2 = max(comments) 
        maxi = max(maxi1, maxi2) + 1
        yint = range(mini, maxi)
        plt.xticks(x, titles)
        plt.yticks(yint)
        
        bar_name = "engagement_bar_" + user["username"] + ".png"
        
        plt.savefig(path + bar_name)
    
    plt.clf()
    
    return render_template("engagement_report.html", current_user = user)
        
    

def generate_pdf(html_file):
    html_obj = HTML(string = html_file)
    pdf_file = html_obj.write_pdf()
#    html_obj.write_pdf("engagement.pdf")
    return pdf_file
#    return "done"
    
       
@celery.task
def send_report():
    users = User.query.all()
    
    with mail.connect() as conn:
        for user in users:
            message = ""
            subject = "Engagement Report"
            
            html_file = generate_html(user)
            
            msg = Message(recipients=[user.email],
                          body=message,
                          subject=subject)
            
            if user.report_format == "pdf":    
                message = "Hey, " + user.username + " please find your attached monthly engagement report in pdf format"
                
                pdf_file = generate_pdf(html_file)
                
                msg = Message(recipients=[user.email],
                          body=message,
                          subject=subject)
                          
                msg.attach("engagement_report.pdf", "application/pdf", pdf_file)
                conn.send(msg)
            
            
            else:
                message = "Hey, " + user.username + " please find your attached monthly engagement report in HTML format. If the image is not showing, Kindly download the report and open it in browser for proper rendering"
                
                msg = Message(recipients=[user.email],
                          body=message,
                          subject=subject) 
                          
                msg.attach("engagement_report.html", "text/html", html_file)
                conn.send(msg)

            
            
 



@celery.task
def send_alert():
    users_list = User.query.all()
    users = users_list.copy()
    
    yesterday = datetime.now() - timedelta(days = 1)
    
    with mail.connect() as conn:
        for user in users:
            message = ""
            subject = "Hello, " + user.username
            
            if  user.last_login_at:           
                if user.last_login_at < yesterday:
                    message = "You have not visited our application since yesterday. Kindly visit our application to improve your engagement with other users"
                    msg = Message(recipients = [user.email],
                              body = message,
                              subject = subject)

                    conn.send(msg)
                    
                
                else:
                    posts = sorted(user.posts, key = lambda post: post.time_stamp)
                    last_post = posts[-1]
                    if last_post.time_stamp < yesterday:
                        message = "You have not posted any blogs in our application since yesterday. Kindly post your blogs regularly so that others users van know more about you."
                        
                        msg = Message(recipients = [user.email],
                              body = message,
                              subject = subject)

                        conn.send(msg)
            else:
                message = "You have not visited our application after signing up your account. Kindly visit our application and login."        
                msg = Message(recipients = [user.email],
                    body = message,
                    subject = subject)

                conn.send(msg)
            
            
                
                
         
         
         