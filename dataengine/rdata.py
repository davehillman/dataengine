#  random data generator
#  Hillman
#  July 2021

import os
import random
import uuid
import datetime
import csv
from faker import Faker
fake = Faker()

# Faker.seed(random.random())
# print(uuid.uuid4())
# print(random.randrange(100,999))
# print(fake.name())
# print(fake.ascii_email())
# print(fake.ipv4_public())
# d = fake.date_between(start_date='-70y', end_date='-20y')
# print( datetime.date.strftime(d, "%m-%d-%Y"))
# print(fake.location_on_land())

dfile = "c:\\Users\\dave\\Desktop\\randomdata.csv"


def create_data(start,stop):
    rset = []
    for i in range(start,stop):
        hdr = header
        drow = {"__rid__":0}
        Faker.seed(random.random())
        drow[hdr[0]] = i
        uname = fake.name()
        drow[hdr[1]] = uname
        uname = uname.replace(" ","")
        uname = uname.replace(".","")
        drow[hdr[2]] = uname + "@" + fake.domain_name()  
        glist = fake.local_latlng()
        gc = 0
        for g in glist:
            drow[hdr[gc+3]] = g
            gc += 1

        drow[hdr[8]] = fake.ipv4_public()
        drow[hdr[9]] = datetime.date.strftime(fake.date_between(start_date='-70y', end_date='-20y'), "%m-%d-%Y")
        drow[hdr[10]] = str(uuid.uuid4())
        rset.append(drow)
    return rset 

header = ['cnt','name','email','lat','lng','city','countrycode','location','ipv4','randate','uuid']


def save_data(cnt=100):
    with open(dfile,mode='w',newline='') as csvfile:

        fieldnames = header
        writer = csv.DictWriter(csvfile,fieldnames=fieldnames,quoting=csv.QUOTE_NONNUMERIC)
        writer.writeheader()
        for i in range(cnt+1):
            writer.writerow(create_data(i))


#save_data(100)