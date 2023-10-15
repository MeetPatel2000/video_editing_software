# video_editing_software
Video Editing Web App - A full-fledged web application for editing and trimming videos. Built with Node.js, Express, and React. Features include video playback, frame capture, and easy-to-use trimming tools.

Video Editing Application
Overview
This application allows users to upload videos, trim them to desired lengths, apply background music, and set filters. The final edited videos are stored in a specific folder on the server.

Workflow
Uploading the Video:

Users can upload their videos which are initially saved in the uploads folder.
Trimming the Video:

Once uploaded, users are redirected to an editing interface.
Using scrubbers and input range elements, users can set the start and end times for the video.
After setting the desired range, users can click the "Trim Video" button.
The backend processes this request, trims the video accordingly, and saves the trimmed video in the trimmed folder.
Background Music and Filters:

After trimming, users are taken to a "show trimmed" page.
Here, they can choose to set background music to the trimmed video.
Additionally, they can apply various filters to enhance the video's appearance.
Viewing the Final Video:

Once all editing is done, users can preview the final edited video before saving or sharing it.

Setup
Steps to set up the application on your local machine.

Clone the Repository:

bash
git clone [repository-url]
Install Dependencies:

pip install -r requirements.txt
Run the Application:


python app.py

Technologies Used
Backend: Flask (or any other frameworks or libraries you used)
Frontend: HTML, CSS, JavaScript

Video Processing: Moviepy 
