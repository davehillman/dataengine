##  fileops.py
##   D. Hillman
##   Aug 2021

## import common
## import os
import csv
import json

fdatadir = "static/filedata/"
fdatafile = "fdata.csv"

def getFilelist():
    dset = []
    with open (fdatadir + fdatafile, "r",) as f:
        rf = csv.reader(f)
        for row in rf:
            fname = fdatadir + row[0] + "/" +  row[1]
            dset.append([fname,row[2]])
    return json.dumps(dset)



##  test space below

##print(getFilelist())