##  dbops.py
##   D. Hillman
##   Sep 2021

##import common
from datetime import datetime, timedelta 
## import os
import sqlite3
## from sqlite3 import dbapi2 as sqlite
import json
import csv
import rdata

conn = sqlite3.connect('')
dbfile = ""

## connect to the database
def connect_db():
    global conn,dbfile
##    conn = sqlite3.connect(common.fpath + dbfile)
    conn = sqlite3.connect(dbfile)

## close the db connection
def close_db():
    global conn
    conn.close()

    
## next proc executes SQL, not looking for a return
def create_tables(sql):
    global conn
    c = conn.cursor()
    c.execute(sql)
    

##  ********************************************************************************

## insert data based on sql, uses ? in flds for data fields
def insert_data(sql,flds):
    global conn
    connect_db()
    try:
        c = conn.cursor()
        c.execute(sql,flds)
        conn.commit()
        id = c.lastrowid
        close_db()
        return id
    except Exception as e:
        close_db()
        print("Did not ingest... ",sql,flds,e.args)
        return False


def select_data(sql):
    global conn
    connect_db()
    try:
        rcur = []
        for row in conn.execute(sql):
            rcur.append(row)
        close_db()
        return rcur
    except:
        print("select error: ", sql)
        close_db()
        return False
    
def delete_data(sql):
    global conn
    connect_db()
    try:
        conn.execute(sql)
        conn.commit()
        close_db()
        return True
    except:
        close_db()
        return False

def update_data(sql):
    global conn
    connect_db()
    try:
        conn.execute(sql)
        conn.commit()
        close_db()
        return True
    except:
        close_db()
        return False


# pragma function only works with sqlite3
# builds a dictionary for the fields and types
def get_fields(tname):
    sql = "PRAGMA table_info(" + tname + ")"
    flds = select_data(sql)
    fcols = []
    for f in flds:
        fcols.append(f[1])
    return fcols        


def get_table(tbl):
    hdr = get_fields(tbl)
    sql = "select * from " + tbl
    dset = select_data(sql)
    rset = []
    if dset is not False:
        for f in dset:
            fset = {}
            cnt = 0
            for i in hdr:
                fset[i] = f[cnt]
                cnt += 1
            rset.append(fset)                
    return rset

def del_enginetables(tbl):
    did = 0
    sql = "select did from dataset where ddesc = '" + tbl + "'"
    edid = select_data(sql)
    if len(edid) > 0: did = edid[0][0]
#    did = str(select_data(sql)[0][0])
    if did > 0:
        did = str(did)
        sql = "delete from dataset where did = " + did
        delete_data(sql)
        sql = "delete from records where did = " + did
        delete_data(sql)
        sql = "delete from attributes where did = " + did
        delete_data(sql)
        sql = "delete from dvalues where did = " + did
        delete_data(sql)


# following ingests data directly from a table
def ingest_table(tbl):
    sql = "insert into dataset (ddesc) values (?)"
    did = insert_data(sql,[tbl])
    hdr = get_fields(tbl)
    dset = get_fields(tbl)  
    aset = []
    for f in dset:
        sql = "insert into attributes (did, adesc) values (?,?)"
        aval = insert_data(sql,[did,f])
        aset.append(aval)
    sql = "select * from " + tbl 
    dset = select_data(sql)
    for r in dset:
        sql = "insert into records (did) values (?)"
        rid = insert_data(sql,[did])
        cnt = 0
        for f in r:
#            print(type(f))

            sql = "insert into dvalues (did, rid,aid,vval,vdate) values (?,?,?,?,?)"
            if f == 'None': f = ""
            now = datetime.now()
            dts = now.strftime("%m/%d/%Y %H:%M:%S")
            insert_data(sql,[did, rid,aset[cnt],f,dts])
            cnt += 1

## following creates dataset
def ingest_jsonds(tbl):
    tb = select_data("select did from dataset where ddesc = '" + tbl + "'")
    if len(tb) > 0: 
        return tb[0][0]
    else:
        tb = insert_data("insert into dataset (ddesc) values (?)",[tbl])
        return tb


## following ingests json data and creates dataset, records, attributes, and 
def ingest_json(tbl, jset):
    did = ingest_jsonds(tbl)
    hdr = get_fields(tbl)
    dset = get_fields(tbl)  
    aset = []
    for f in dset:
        sql = "insert into attributes (did, adesc) values (?,?)"
        aval = insert_data(sql,[did,f])
        aset.append(aval)
    sql = "select * from " + tbl 
    dset = select_data(sql)
    for r in dset:
        sql = "insert into records (did) values (?)"
        rid = insert_data(sql,[did])
        cnt = 0
        for f in r:
            if f != "":
                sql = "insert into dvalues (did, rid,aid,vval,vdate) values (?,?,?,?,?)"
                now = datetime.now()
                dts = now.strftime("%m/%d/%Y %H:%M:%S")
                insert_data(sql,[did, rid,aset[cnt],f,dts])
            cnt += 1

def get_datasets():
    sql = "select did, ddesc from dataset"
    dlist = select_data(sql)
    return json.dumps(dlist)


def get_engine(ds,rid=0):
    sql = "select records.rid, attributes.adesc, dvalues.vdate, dvalues.vval from dvalues "
    sql = sql + "inner join dataset on dvalues.did = dataset.did "
    sql = sql + "inner join attributes on dvalues.aid = attributes.aid "
    sql = sql + "inner join records on dvalues.rid = records.rid "
    sql = sql + "where dataset.did = " + str(ds) + " "
    if rid != 0: sql = sql + "and records.rid = " + str(rid) + " "
    sql = sql + "order by dataset.did, records.rid, attributes.aid"
    dset = select_data(sql)
    fdata = []
    rid = 0
    for r in dset:
        if int(r[0]) != rid: 
            if rid != 0: fdata.append(dd)
            rid = int(r[0])
            dd = {"__rid__" : rid}
        dd[r[1]] = r[3]
    if rid != 0: fdata.append(dd)
    return json.dumps(fdata)

## following checks for dataset and returns id val, if not found creates it and returns id val
def create_dataset(desc):
    did = 0
    sql = "select did from dataset where ddesc = '" + desc + "'"
    did = select_data(sql)
    if len(did) == 0:
        sql = "insert into dataset (ddesc) values (?)"
        did = insert_data(sql,[desc])
    else:
        did = did[0][0]
    return did

## following checks for attributes; creates if needed and returns list of id values
def create_attributes(did, attrs):
    sql = "select aid from attributes where did = " + str(did)
    aset = select_data(sql)
    if len(aset) == 0:
        aset = []
        for f in attrs:
            sql = "insert into attributes (did, adesc) values (?,?)"
            aval = insert_data(sql,[did,f])
            aset.append(aval)
    else:
        nset = []
        for i in aset:
            nset.append(i[0])
        aset = nset
    return aset



## following handles update, insert, delete via formatted json data
def update_engine(ds,jset):
##    sql = "select did from dataset where ddesc = '" + ds + "'"
##    did = select_data(sql)[0][0]
    did = ds
    sql = "select aid,adesc from attributes where did = " + str(did)
    attr = select_data(sql)
    aset={}
    for i in attr:
        aset[i[1]] = i[0]
    anames = {}
    for i in attr:
        anames[i[0]] = i[1]
#    print(aset)
#    print(anames)

    for i in jset:
        rid = i['__rid__']
#        print("Del setup", len(i), rid)
        if len(i) == 1 and rid != 0: 
#            print("DELETION")
            sql = "delete from dvalues where rid = " + str(rid)
            delete_data(sql)
            sql = "delete from records where rid = " + str(rid)
            delete_data(sql)

        if rid > 0: 
            for f in i:
                if f != '__rid__':
                    ## question, do we need the following, if __rid__ value is > 0, automatically assume update is required
                    if i[f] == None: i[f] = ""
                    vid = select_data('select * from dvalues where did = ' + str(did) + ' and rid = ' + str(rid) + ' and aid = ' + str(aset[f]) + ' and vval = \'' + i[f] + '\'')
                    if len(vid) == 0: 
#                        print(aset[f],i[f],"UPDATE")
                        if i[f] == None: i[f] = ""
                        sql = "update dvalues set vval = \'" + i[f] + "\'" + " where did = " + str(did) + " and rid = " + str(rid) + " and aid = " + str(aset[f])
                        update_data(sql)
        elif rid == 0:
            sql = "insert into records (did) values (?)"
            rid = insert_data(sql,[int(did)])
#            print(did,rid,jset,"NEW")
            akeys = list(aset.keys())
            avals = list(aset.values())
            for aid in akeys:
                sql = "insert into dvalues (did, rid,aid,vval,vdate) values (?,?,?,?,?)"
                now = datetime.now()
                dts = now.strftime("%m/%d/%Y %H:%M:%S")
#                print(did, rid,aset[aid],"",dts)
                vdata = i[anames[aset[aid]]]
#                print(vdata)
                insert_data(sql,[did, rid,aset[aid],vdata,dts])

    return

## following ingests csv into an array
def ingest_csv_table(fname,tname):
    with open(fname, mode='r') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        line_count = 0
        cdata = []
        for row in csv_reader:
            if line_count == 0:
                hdr = [", ".join(row)]
                line_count += 1
            cdata.append(row)

    return(cdata)



def ingest_random(ds,hdr,dset):
    did = create_dataset(ds)
    aset = create_attributes(did,hdr)

    update_engine(did,dset)


## following reloads test data sets

# del_enginetables("devices")
# print(ingest_table("devices"))

# #del_enginetables("people")
# print(ingest_table("people"))


# #del_enginetables("places")
# print(ingest_table("places"))

# #del_enginetables("sparsetest")
# print(ingest_table("sparsetest"))

def buildRandom(total,dname):
## clear all data
    del_enginetables(dname)
    cycle = total/1000
    for i in range(int(cycle)):
        print((i * 1000))
        rdataset = rdata.create_data(i * 1000, (i * 1000) + 1000)
        ingest_random(dname,rdata.header,rdataset)

def clearAll():
    sql = "select ddesc from dataset"
    dsets = select_data(sql)
    print(dsets)
    for i in dsets:
        print("Deleting dataset: " + i[0])
        del_enginetables(i[0])
    print("Done")

##clearAll()
