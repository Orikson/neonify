"""
    Author: Eron Ristich
    Date: 9/21/21
    File: ./neonify/__init__.py
    Description: Initialize the application factory
    Notes: Code adapted from the flask tutorial [found at https://flask.palletsprojects.com/en/2.0.x/tutorial/]
"""

import os
from flask import Flask, render_template, jsonify, request, send_file
import base64
import tempfile
from neonify import neonify
from io import BytesIO


UPLOAD_FOLDER = "static/uploads/"

def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        # should be overwritten to a random value when deploying
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'neonify.sqlite'),
    )

    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

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

    @app.route('/_neonify', methods=['GET', 'POST'])
    def neonifyit():
        img_response = request.values['imageBase64']
        #print(img_response)

        img_data = str.encode(img_response.split(',')[1])
        
        temp = tempfile.NamedTemporaryFile()
        temp.write(base64.decodebytes(img_data))
        temp.seek(0)
        
        img_file = BytesIO(temp.read())
        temp.close()
        img_file.seek(0)
        #print(base64.b64encode(img_file.getvalue()).decode())
        #img_file.seek(0)

        neonified = neonify.neon(img_file)
        
        img_io = BytesIO()
        neonified.save(img_io, 'PNG')
        img_io.seek(0)
        
        img_final = 'data:image/png;base64,' + base64.b64encode(img_io.getvalue()).decode()

        return jsonify(img=img_final)
    
    from . import db
    db.init_app(app)

    return app