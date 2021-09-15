##  chartops.py
##   D. Hillman
##  Sep 2021

## import common
## import os
import csv
import json

fdatadir = "static/filedata/"
fdatafile = "bardata.csv"

def getbarlist():
    dset = []
    with open (fdatadir + fdatafile, "r",) as f:
        rf = csv.reader(f)
        for row in rf:
            dset.append(int(row[0]))
    return json.dumps(dset)

ldatafile = "linedata.csv"
def getlinelist():
    dset = []
    with open (fdatadir + ldatafile, "r",) as f:
        rf = csv.reader(f)
        cnt = 0
        for row in rf:
            fset = []
            if cnt == 0:
                fset = row
            else:
                for j in row:
                    fset.append(int(j))
            cnt =+ 1
            dset.append(fset)
    return json.dumps(dset)



##  test space below

## print(getlinelist())