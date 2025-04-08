import re
from datetime import datetime, timedelta

def parse_log_file(file_path):
    """
    Parse the log file and extract video information and durations.
    
    Args:
        file_path (str): Path to the log file
        
    Returns:
        list: List of tuples (video_title, duration_in_seconds)
    """
    videos = []
    
    with open(file_path, 'r') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
                
            # Split the line by comma and strip whitespace
            parts = [part.strip() for part in line.split(',')]
            
            if len(parts) >= 2:
                # Extract the filename and duration
                filename = parts[0]
                duration_str = parts[1]
                
                # Extract the video title from the filename
                # Format: YYYYMMDD_HHMM_Title_remix_ID.mp4
                match = re.match(r'\d+_\d+_(.+?)_[\w\d]+\.mp4$', filename)
                if not match:
                    print(f"Warning: Could not extract title from filename: {filename}")
                    video_title = filename  # Use the whole filename as fallback
                else:
                    # Replace underscores with spaces
                    video_title = match.group(1).replace('_', ' ')
                    video_title = match.group(1)
                    # Replace underscores with spaces
                    video_title = video_title.replace('_', ' ')
                    
                    # Parse the duration (format: 0:00:05 or 0:00:10)
                    time_parts = [int(t) for t in duration_str.split(':')]
                    
                    # Calculate duration in seconds
                    if len(time_parts) == 3:  # Format: h:mm:ss
                        hours, minutes, seconds = time_parts
                        duration_seconds = hours * 3600 + minutes * 60 + seconds
                    elif len(time_parts) == 2:  # Format: mm:ss
                        minutes, seconds = time_parts
                        duration_seconds = minutes * 60 + seconds
                    else:
                        print(f"Warning: Could not parse duration '{duration_str}' for '{filename}'")
                        continue
                    
                    videos.append((video_title, duration_seconds))
    
    return videos

def generate_youtube_toc(videos):
    """
    Generate a YouTube table of contents with timestamps.
    
    Args:
        videos (list): List of tuples (video_title, duration_in_seconds)
        
    Returns:
        str: Formatted table of contents
    """
    toc = []
    current_time = timedelta(seconds=0)
    
    for i, (title, duration) in enumerate(videos):
        # Format the timestamp (YouTube format: HH:MM:SS or MM:SS)
        if current_time.total_seconds() < 3600:  # Less than 1 hour
            timestamp = f"{int(current_time.total_seconds() // 60):01d}:{int(current_time.total_seconds() % 60):02d}"
        else:
            timestamp = f"{int(current_time.total_seconds() // 3600):01d}:{int((current_time.total_seconds() % 3600) // 60):02d}:{int(current_time.total_seconds() % 60):02d}"
        
        # Add to table of contents
        toc.append(f"{timestamp} - {title}")
        
        # Increment the current time
        current_time += timedelta(seconds=duration)
    
    return "\n".join(toc)

def main():
    log_file_path = input("Enter the path to your log file (Example Default: ./video_catalog.log): ") or "./video_catalog.log"
    
    try:
        videos = parse_log_file(log_file_path)
        
        if not videos:
            print("No videos found in the log file.")
            return
            
        toc = generate_youtube_toc(videos)
        
        print("\nTable of Contents:")
        print("==========================")
        print(toc)
        
        # Optionally save to a file
        save_option = input("\nDo you want to save this to a file? (y/n): ")
        if save_option.lower() == 'y':
            output_file = input("Enter the output file name (default: video_catalog.toc): ") or "video_catalog.toc"
            with open(output_file, 'w') as f:
                f.write(toc)
            print(f"Table of contents saved to {output_file}")
            
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()