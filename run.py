from dotenv import load_dotenv
load_dotenv()

import subprocess

# initialize db
subprocess.call('C:\Windows\System32\WindowsPowerShell\\v1.0\powershell.exe flask init-db', shell=True)

# run app
subprocess.call('C:\Windows\System32\WindowsPowerShell\\v1.0\powershell.exe flask run', shell=True)
