Fantasy Sports Meta-Manager
===========================

# How run?
First it's necessary run the Web Server, and then, run the Jobs Scheduler

## 1) Run Web Server:
-------
```
node app
```
... and wait for these message logs in Console:
```
New League Added
Teams Added
Team Info Loaded
Players Added
Sources Added
Keys Players Updated
Manual Url Players from NetLiga Added
```

## 2) Run Jobs Scheduler:
When the Console.log previous appear:
```
node jobs
```
