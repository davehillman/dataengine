## dataengine
# ## app.py
## Hillman
## Sep 2021

import common
from flask import Flask, render_template, request
import dbops
import fileops
import json
import chartops

app = Flask(__name__)

@app.errorhandler(404)
def page_not_found(error):
    return render_template('pgnotfound.htm'), 404

def workpaths():
    wpath = [common.upath, 
        common.upath + '/indexview', 
        common.upath + '/indexcomment', 
        common.upath + '/indexgraphs',
        common.upath + '/indexfiles',
        common.upath + '/indexmaps']
    return wpath

## page routing follows

@app.route('/')
def index():
    return render_template('index.htm',
                    cpath = workpaths()
                      )


@app.route('/indexview')
def indexview():
##    dbops.dbfile = "static/db/dbengview.db"
    return render_template('indexview.htm',
               cpath = workpaths()   
               )

@app.route('/indexcomment')
def indexcomment():
    dbops.dbfile = "static/db/dbengcomm.db"
    return render_template('indexcomment.htm',
               cpath = workpaths()   
               )

@app.route('/indexgraphs')
def indexgraphs():
    return render_template('indexgraphs.htm',
               cpath = workpaths()   
               )

@app.route('/indexfiles')
def indexfiles():
    return render_template('indexfiles.htm',
               cpath = workpaths()   
               )


@app.route('/indexmaps')
def indexmaps():
    return render_template('indexmaps.htm',
               cpath = workpaths()   
               )

## REST calls, typically from jQuery follow

@app.route("/getfilelist",methods=['GET','POST'])
def getfilelist():
    fset = fileops.getFilelist()
    return fset


@app.route("/getds",methods=['GET','POST'])
def getds():
    dbops.dbfile = "static/db/dbengview.db"
    dslist = dbops.get_datasets()
    return dbops.get_datasets()


@app.route("/getdata",methods=['GET','POST'])
def getdata():
    dbops.dbfile = "static/db/dbengview.db"
    did = request.args.get("did")
    dset = dbops.get_engine(did)    
    return dset

@app.route("/getedit",methods=['GET','POST'])
def getedit():
    dbops.dbfile = "static/db/dbengview.db"
    did = request.args.get("did")
    rid = request.args.get("rid")
    dset = dbops.get_engine(did,rid)    
    return dset

@app.route("/upddata",methods=['GET','POST'])
def upddata():
    dbops.dbfile = "static/db/dbengview.db"
    did = ""
    dset = ""
    if request.method == 'POST':
        did = request.form.getlist("did")[0]
        dset = json.loads(request.form.getlist("dset")[0])
        dbops.update_engine(did,dset)
    return "true"

@app.route("/deldata",methods=['GET','POST'])
def deldata():
    dbops.dbfile = "static/db/dbengview.db"
    did = ""
    dset = ""
    if request.method == 'POST':
        did = request.form.getlist("did")[0]
        dset = json.loads(request.form.getlist("dset")[0])
        dsetdel = []
##need to get a list of __rid__s for deletion
        for r in dset:
            rid = r["__rid__"]
            if rid == 0: rid = -1
            dsetdel.append({"__rid__" : rid})
        dbops.update_engine(did,dsetdel)
    return "true"

## ----------------------------------------------------------
## chartops  

@app.route("/getbarchart",methods=['GET','POST'])
def getbarchart():
    cset = chartops.getbarlist()
    return cset

@app.route("/getlinechart",methods=['GET','POST'])
def getlinechart():
    cset = chartops.getlinelist()
    return cset


## ----------------------------------------------------------

if __name__ == '__main__':
    app.run(debug=True)
## hide above, use following for deployment    app.run(host='0.0.0.0')
    