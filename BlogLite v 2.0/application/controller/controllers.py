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

from flask import render_template, url_for, redirect, request
from main import app
from datetime import datetime
from application.utils.security import user_datastore
from flask_security import auth_required, hash_password, current_user



#print("in controller app", app)


@app.route("/", methods = ["GET", "POST"])
def index():
    if request.method == "GET":
        return render_template("Home.html")
