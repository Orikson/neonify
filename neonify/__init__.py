"""
    Author: Eron Ristich
    Date: 9/21/21
    File: ./neonify/__init__.py
    Description: Initialize the application factory
    Notes: Code adapted from the flask tutorial [found at https://flask.palletsprojects.com/en/2.0.x/tutorial/]
"""

import os
from flask import Flask, render_template, jsonify, request

def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        # should be overwritten to a random value when deploying
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'neonify.sqlite'),
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    @app.route('/')
    def canvas():
        return render_template('canvas.html')
        #return render_template('testing.html')

    @app.route('/_neonify')
    def neonify():
        return jsonify(response="neonified")
    
    from . import db
    db.init_app(app)

    return app