from flask import flash
from flask.ext.wtf import Form
from wtforms import TextField, PasswordField, BooleanField, SubmitField
from wtforms.validators import Required, Email
from werkzeug import check_password_hash, generate_password_hash
from toolbox.models import User, Administrator


class CreateForm(Form):
    email = TextField('Email address', [Required(), Email()])
    hostname = TextField('Hostname', [Required()])
    send_invite = BooleanField('Send invitation email?', [Required()])
    submit = SubmitField('Submit')

    def __init__(self, *args, **kwargs):
        Form.__init__(self, *args, **kwargs)
        self.user = None

    def validate(self):
        if User.objects(email=self.email.data).first() is not None:
            flash("This email address already has an account")
            return False
        return True


class LoginForm(Form):
    email = TextField('Email address', [Required()])
    password = PasswordField('Password', [Required()])
    submit = SubmitField('Trowel')

    def __init__(self, *args, **kwargs):
        Form.__init__(self, *args, **kwargs)
        self.user = None

    def validate(self):
        try:
            user = User.objects.get(email=self.email.data)
        except User.DoesNotExist:
            flash("This email address is not in the system.")
            return False

        if not user.confirmed:
            flash("Account not yet confirmed. Check your email. ")
            return False

        if not check_password_hash(user.password, self.password.data):
            flash("Invalid password, please try again.")
            return False

        self.user = user
        return True
