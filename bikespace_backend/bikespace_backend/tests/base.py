# bikespace_backend/bikespace_backend/tests/base.py

from flask_testing import TestCase

from bikespace_backend import create_app, db

app = create_app()

class BaseTestCase(TestCase):
    def create_app(self):
        app.config.from_object('bikespace_backend.config.TestingConfig')
        return app

    def setup(self):
        db.create_all()
        db.session.commit()

    def tearDown(self):
        db.session.remove()
        db.drop_all()