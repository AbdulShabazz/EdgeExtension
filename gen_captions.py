import re
from datetime import datetime, timedelta

def log_to_youtube_captions(log_file_path, output_file_path):
    """
    Convert a log file with video titles and durations to a YouTube time-stamped caption file.
    
    Format of log file:
    filename.mp4, duration
    
    Format of output file:
    00:00:00 Video Title 1
    00:00:05 Video Title 2
    ...
    """
    captions = []
    current_time = timedelta(seconds=0)
    
    # Read the log file
    with open(log_file_path, 'r') as log_file:
        for line in log_file:
            # Skip empty lines
            if not line.strip():
                continue
                
            # Parse the line
            parts = line.strip().split(', ')
            if len(parts) != 2:
                print(f"Warning: Skipping malformed line: {line}")
                continue
                
            filename, duration_str = parts
            
            # Extract title from filename
            # Assuming format: DATE_TIME_TITLE_remix_ID.mp4
            match = re.match(r'\d+_\d+_(.+?)_remix_', filename)
            if not match:
                print(f"Warning: Could not extract title from filename: {filename}")
                title = filename  # Use the whole filename as fallback
            else:
                title = match.group(1).replace('_', ' ')
            
            # Parse duration (format: 0:00:05)
            try:
                duration_parts = duration_str.split(':')
                if len(duration_parts) == 2:
                    duration = timedelta(minutes=int(duration_parts[0]), 
                                        seconds=int(duration_parts[1]))
                elif len(duration_parts) == 3:
                    duration = timedelta(hours=int(duration_parts[0]),
                                        minutes=int(duration_parts[1]), 
                                        seconds=int(duration_parts[2]))
                else:
                    raise ValueError(f"Invalid duration format: {duration_str}")
            except ValueError as e:
                print(f"Warning: {e}")
                continue
            
            # Format the current time as HH:MM:SS
            time_str = str(current_time).rjust(8, '0')
            if time_str.startswith('0:'):  # Ensure HH:MM:SS format
                time_str = '0' + time_str
            
            # Add the caption
            captions.append(f"{time_str} {title}")
            
            # Increment the current time
            current_time += duration
    
    # Write the output file
    with open(output_file_path, 'w') as output_file:
        output_file.write('\n'.join(captions))
    
    print(f"Created YouTube caption file: {output_file_path}")
    print(f"Total videos: {len(captions)}")
    print(f"Total duration: {current_time}")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 3:
        print("Usage: python -m log_to_captions video_catalog.log video_catalog.captions")
        sys.exit(1)
    
    log_file_path = sys.argv[1]
    output_file_path = sys.argv[2]
    
    log_to_youtube_captions(log_file_path, output_file_path)