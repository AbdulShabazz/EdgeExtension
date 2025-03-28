#!/usr/bin/env python3
import os
import subprocess
import argparse
import tempfile
#import shutil

# Standard progressive resolutions mapping
STANDARD_RESOLUTIONS = {
    "480": (854, 480),    # 480p (16:9) (widthxheight)
    "720": (1280, 720),   # 720p
    "1080": (1920, 1080), # 1080p
    "2160": (3840, 2160), # 4K UHD
    "4K": (3840, 2160), # Alternative name for 4K
    "4096": (4096, 2160)  # 4K DCI
}

def parse_log_file(log_file_path):
    """Parse the log file to get video filenames in order."""
    videos = []
    with open(log_file_path, 'r') as f:
        for line in f:
            if line.strip():
                # Split by comma and take the first part (filename)
                filename = line.split(',')[0].strip()
                videos.append(filename)
    return videos

def standardize_videos(videos, output_dir, resolution, width, height):
    """Standardize all videos to the specified resolution."""

    if (resolution in STANDARD_RESOLUTIONS):
        width = STANDARD_RESOLUTIONS[resolution][0]
        height = STANDARD_RESOLUTIONS[resolution][1]

    standardized_videos = []
    
    for i, video in enumerate(videos):
        output_filename = os.path.join(output_dir, f"standardized_{i}.mp4")
        
        # Use ffmpeg to standardize the video resolution
        cmd = [
            'ffmpeg',
            '-i', video,
            '-vf', f'scale={width}:{height}:force_original_aspect_ratio=decrease,pad={width}:{height}:(ow-iw)/2:(oh-ih)/2',
            '-c:v', 'libx264',
            '-crf', '0',  # Quality setting (0 is best; 10 is best for Youtube)
            '-preset', 'veryslow',  # Encoding speed/quality balance
            '-c:a', 'aac',
            '-b:a', '320k',
            '-y',  # Overwrite output files without asking
            output_filename
        ]
        
        print(f"Standardizing video {i+1}/{len(videos)}: {video}")
        subprocess.run(cmd, check=True)
        standardized_videos.append(output_filename)
    
    return standardized_videos

def create_concat_file(videos, concat_file_path):
    """Create a concat file for ffmpeg to use."""
    with open(concat_file_path, 'w') as f:
        for video in videos:
            f.write(f"file '{video}'\n")

def combine_videos(concat_file_path, output_file):
    """Combine videos using the concat file."""
    cmd = [
        'ffmpeg',
        '-f', 'concat',
        '-safe', '0',
        '-i', concat_file_path,
        '-c', 'copy',  # Copy streams without re-encoding
        '-y',  # Overwrite output files without asking
        output_file
    ]
    
    print(f"Combining videos into {output_file}")
    subprocess.run(cmd, check=True)

def main():
    parser = argparse.ArgumentParser(description='Combine videos based on a .log file (Default: ./video_catalog.log).')
    parser.add_argument('--log_file', default='video_catalog.log', help='Path to the log file. (Default: ./video_catalog.log) (Example: log_file ./video_catalog.log)')
    parser.add_argument('--output', '-o', default='video_catalog.mp4', help='Output file name')
    parser.add_argument('--resolution', '-r', type=int, default=1080, help='target (horizontal progressive width) resolution. (Default: 1080 for 1080p) (Example: --resolution 1080)')
    parser.add_argument('--width', '-w', type=int, default=1920, help='Output video width (default: 1920 for 1920p) (Example: --width 1920)')
    parser.add_argument('--height', '-ht', type=int, default=1080, help='Output video height (default: 1080 for 1080p) (Example: --height 1080)')
    
    args = parser.parse_args()
    
    # Get the directory of the log file to find the videos
    log_dir = os.path.dirname(os.path.abspath(args.log_file))
    
    # Parse the log file to get the video filenames in order
    video_filenames = parse_log_file(args.log_file)
    
    # Get full paths to all videos
    videos = [os.path.join(log_dir, filename) for filename in video_filenames]
    
    # Check if all videos exist
    missing_videos = [v for v in videos if not os.path.exists(v)]
    if missing_videos:
        print("Error: The following videos were not found:")
        for v in missing_videos:
            print(f"  {v}")
        return
    
    # Create a temporary directory for intermediate files
    with tempfile.TemporaryDirectory() as temp_dir:
        # Standardize all videos to the specified resolution
        standardized_videos = standardize_videos(videos, temp_dir, args.resolution, args.width, args.height)
        
        # Create a concat file for ffmpeg
        concat_file_path = os.path.join(temp_dir, 'concat.txt')
        create_concat_file(standardized_videos, concat_file_path)
        
        # Combine all videos
        combine_videos(concat_file_path, args.output)
    
    print(f"Video combination complete! Output saved to '{args.output}'")

if __name__ == '__main__':
    main()