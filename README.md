# quick-dashboard

## What is this?
A dashboard that does not need a full web server stack. It runs completely locally over a LAN so that a person could impromptu pop up on a display for group work without worrying about infrastructure or internet security postures. This project uses a JSON file to read in the list of tasks, and updates it at an interval (a default of 5 minutes). There is also an option to display a QR code to save on typing the complete URI.

## How do you use it?
1. Follow the instructions under the **Usage** heading to download/build the application.
2. Upon running the executable, the program will prompt you for a filepath on where to fetch the data from (examples of which can be found under testData in this repo.
3. It will find the local IP of the device on the network and ask if that is okay to use. Typing 'N' will prompt for an IP address and a port number to use.
4. A webserver will run using the address provided and generate a QR code under `static/qr.png`. which can be used to quickly access the webserver from other devices.
5. Logging can be found under log.txt, which contains INFO, DEBUG, and ERROR messages for the webserver.

## Screenshots
### On a Computer
![image](https://github.com/user-attachments/assets/258e6b23-532d-4f5e-9a30-9181192ef476)
![image](https://github.com/user-attachments/assets/4f7419e2-7de6-4bce-801b-e887e168c51f)

### On a Phone
![image](https://github.com/user-attachments/assets/77b69e47-e1ff-4c26-9df4-49deeadebb9d)
![image](https://github.com/user-attachments/assets/a62b3d71-36ad-4d8c-9361-1dfea2ab17e8)



## Usage
### Pre-built
1. Download the relavent zipfile from the Releases Tab
2. Unzip and run the executable as is.

## Build
1. Install golang
2. Clone the repo
3. Build the project by running `go build` in the repository directory
4. Run the executable.

It is important that you keep the static folder and main.go where they are, as they are necessary for each other.


Feedback is always appriciated!


## License
This project is licensed under the GNU GPLv3 with the Common Clause v1 added.
