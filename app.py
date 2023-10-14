from flask import Flask, render_template, request, redirect, url_for, session, send_file, flash, jsonify
from urllib.parse import quote
from moviepy.editor import VideoFileClip, clips_array, AudioFileClip, concatenate_videoclips
from moviepy.editor import *
import matplotlib
import matplotlib.pyplot as plt
import numpy as np
from io import BytesIO
import os
from uuid import uuid4
from PIL import Image, ImageDraw
from moviepy.video.io.ffmpeg_tools import ffmpeg_extract_subclip
from moviepy.video import fx
from moviepy.video.fx import all as vfx
from werkzeug.utils import secure_filename
from moviepy.video.fx.lum_contrast import lum_contrast



app = Flask(__name__)
app.secret_key = 'my_temporary_secret_key'  # Replace with a secret key of your choice

UPLOAD_FOLDER = 'static/uploads'
PROCESSED_FOLDER = 'static/processed'
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mkv', 'mp3'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['EDITED_VIDEO_DIRECTORY'] = 'static/trimmed'
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0 


def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('upload.html')

@app.route('/upload', methods=['POST'], endpoint='upload')
def upload_file():
    if 'file' not in request.files:
        return redirect(request.url)

    file = request.files['file']

    if file.filename == '':
        return redirect(request.url)
    
    if file and allowed_file(file.filename):
        filename = file.filename
        video_folder = app.config['UPLOAD_FOLDER']
        file.save(os.path.join(video_folder, filename))  # Save the file to the upload folder
        session['uploaded_filename'] = filename  # Store the filename in the session
        flash('Upload successful', 'success')  # Optionally, you can use the flash message to indicate success
        return redirect(url_for('upload_success'))
    else:
        flash('Invalid file format', 'error')  # Optionally, use flash to indicate the error
        return redirect(request.url)


@app.route('/upload_success')
def upload_success():
    message = request.args.get('message')
    filename = session.get('uploaded_filename')  # Retrieve the filename from the session
    return render_template('upload_success.html', message=message, filename=filename)

@app.route('/edit_video')
def edit_video():
    filename = session.get('uploaded_filename')
    if not filename:
        return "No video selected for editing."
        return redirect(url_for('upload_success')) # delete this 

    try:
        video_path = os.path.join('static/uploads', filename)
        video = VideoFileClip(video_path)
        duration = video.duration
        return render_template('edit_video.html', video=filename, duration=duration) #delete this
    
        # Create a timeline image
        plt.figure(figsize=(10, 1))
        plt.barh(0, duration, height=0.1)
        plt.yticks([])
        plt.xlim(0, duration)

        # Save the timeline as a bytes object
        timeline_img = BytesIO()
        plt.savefig(timeline_img, format='png', bbox_inches='tight')
        timeline_img.seek(0)

        return render_template('edit_video.html', video=filename, timeline=timeline_img.read())
    
    except Exception as e:
        flash(f"Error: {e}")
        return redirect(url_for('upload_success'))



@app.route('/trim_video', methods=['POST'])
def trim_video():
    start_time = float(request.form.get('start_time', 0.0))
    end_time = float(request.form.get('end_time', 0.0))
    filename = session.get('uploaded_filename')
    filter_type = request.form.get('filter_type')

    if not filename:
        flash("No video selected for trimming.")
        return redirect(url_for('edit_video'))

    try:
        video_path = os.path.join('static/uploads', filename)
        output_path = os.path.join('static/trimmed', filename)

        # Extract the specified subclip from the video
        edited_video = VideoFileClip(video_path).subclip(start_time, end_time)

        # Apply grayscale filter if selected
        if filter_type == 'grayscale':
            edited_video = edited_video.fx(vfx.blackwhite)

        # Save the edited video
        edited_video.write_videofile(output_path, codec="libx264")

        flash("Video trimmed and filtered successfully.")
        return redirect(url_for('edit_video'))

    except Exception as e:
        flash(f"Error: {e}")
        return redirect(url_for('edit_video'))

        
@app.route('/show_trimmed_video', methods=['GET', 'POST'])
def show_trimmed_video():
    # Retrieve filename from session
    filename = session.get('uploaded_filename')
    if not filename:
        flash("No video available to show.")
        return redirect(url_for('index'))

    video_path = os.path.join(app.config['EDITED_VIDEO_DIRECTORY'], filename)
    
    # If a filter is applied through the POST request
    if request.method == 'POST':
        filter_option = request.form.get('filter_option')
    return render_template('show_trimmed_video.html', filename=filename)

@app.route('/save', methods=['POST'])
def save():
    # Capture data from frontend
    video_filename = request.form.get('videoFilename')  
    if not video_filename:
        return jsonify({"error": "Video filename not provided!"}), 400
    
    filter_type = request.form.get('filter')
    playback_speed = float(request.form.get('playbackSpeed', 1.0))
    music_start_time = float(request.form.get('musicStartTime', 0))
    
    # Build the path to the video file
    video_path = os.path.join("static/trimmed", video_filename)

    # Check if the file exists
    if not os.path.exists(video_path):
        return jsonify({"error": "File not found!"}), 404

    # Load the video
    clip = VideoFileClip(video_path)
    
    # Check the duration of the video
    video_duration = clip.duration
    
    # Apply playback speed
    clip = clip.fx(vfx.speedx, playback_speed)
    
    # Handle background music
    if 'backgroundMusic' in request.files:
        audio_file = request.files['backgroundMusic']
    if audio_file and allowed_file(audio_file.filename):
        filename = secure_filename(audio_file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        audio_file.save(filepath)
        
        # Load the video
        clip = VideoFileClip(video_path)
        video_duration = clip.duration

        # Load background music and set the start time
        full_audio = AudioFileClip(filepath)
        
        # Trim or loop the audio to match video duration
        if full_audio.duration - music_start_time > video_duration:
            # Trim the audio if it's longer than the video
            audio = full_audio.subclip(music_start_time, music_start_time + video_duration)
        else:
            # Loop the audio if it's shorter than the video
            loops = int(video_duration // (full_audio.duration - music_start_time))
            remaining_time = video_duration % (full_audio.duration - music_start_time)
            
            audio_clips = [full_audio.subclip(music_start_time)] * loops
            if remaining_time > 0:
                audio_clips.append(full_audio.subclip(music_start_time, music_start_time + remaining_time))
            
            audio = concatenate_audioclips(audio_clips)
        
        # Set the audio of the video to the selected background music
        clip = clip.set_audio(CompositeAudioClip([audio]))


    if filter_type.lower() == "grayscale":
        clip = clip.fx(vfx.colorx, 0.5)
    # Save the processed video
    
    output_file = "static/processed/edited_video.mp4"
    clip.write_videofile(output_file)

    return jsonify({"message": "Video processed and saved!", "path": output_file})


@app.route('/play_video/<filename>')
def play_video(filename):
    video_folder = app.config['UPLOAD_FOLDER']  
    return send_file(os.path.join(video_folder, filename))


# Render the HTML page with the video player
@app.route('/video_player')
def video_player():
    return render_template('video_player.html')

if __name__ == '__main__':
    app.run(debug=True)
    
#checking the version
