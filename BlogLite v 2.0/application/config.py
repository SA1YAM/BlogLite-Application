import os, sys
basedir = os.path.abspath(os.path.dirname(__file__))

current = os.path.dirname(os.path.realpath(__file__))
#print("current",current)

parent = os.path.dirname(current)
sys.path.append(parent)
#print("parent",parent)


store_img = parent + "/static/Images"
#print("image_store",store_img)


class Config():
    DEBUG = False
    SQLITE_DB_DIR = None
    SQLALCHEMY_DATABASE_URI = None
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    WTF_CSRF_ENABLED = False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "Authentication-Token"
    #CELERY_BROKER_URL = "redis://localhost:6379/1"
    #CELERY_RESULT_BACKEND = "redis://localhost:6379/2"
    #REDIS_URL = "redis://localhost:6379"
    

class LocalDevelopmentConfig(Config):
    SERVER_NAME = "127.0.0.1:5000"
    APPLICATION_ROOT = "/"
    SQLITE_DB_DIR = os.path.join(basedir, "../db_directory")
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(SQLITE_DB_DIR, "testdb.db")
    DEBUG = True
    SECRET_KEY =  "really superrrr secret"
    SECURITY_PASSWORD_HASH = "bcrypt"    
    SECURITY_PASSWORD_SALT = "reallyyyy super secret" # Read from ENV in your case
    WTF_CSRF_ENABLED = False
    UPLOAD_FOLDER = store_img
    
    SECURITY_EMAIL_VALIDATOR_ARGS = { "check_deliverability" : True }
    
    CELERY_BROKER_URL = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND = "redis://localhost:6379/2"
    REDIS_URL = "redis://localhost:6379"
    CACHE_TYPE = "RedisCache"
    CACHE_DEFAULT_TIMEOUT = 1000
    CACHE_REDIS_URL = "redis://localhost:6379/9" 
    MAIL_SERVER = "smtp.gmail.com"
    MAIL_PORT = 587
    MAIL_USERNAME = 'blogliteserver@gmail.com'
    MAIL_PASSWORD = 'dwczflnppzuzvorw'
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_DEFAULT_SENDER = "blogliteserver@gmail.com"

