import re
from datetime import datetime, timedelta

def log_to_srt_captions(log_file_path, output_file_path):
    """
    Convert a log file with video titles and durations to a YouTube SRT caption file.
    
    Format of log file:
    filename.mp4, duration
    
    Format of output SRT file:
    1
    00:00:00,000 --> 00:00:05,000
    Video Title 1
    
    2
    00:00:05,000 --> 00:00:10,000
    Video Title 2
    ...
    """
    srt_entries = []
    current_time = timedelta(seconds=0)
    entry_number = 1
    
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
            
            # Calculate start and end times
            start_time = current_time
            end_time = start_time + timedelta(seconds=int(2)) # duration
            
            # Format times as SRT format: HH:MM:SS,mmm
            start_str = format_srt_time(start_time)
            end_str = format_srt_time(end_time)
            
            # Create SRT entry
            srt_entry = f"{entry_number}\n{start_str} --> {end_str}\n{title}\n"
            srt_entries.append(srt_entry)
            
            # Increment entry number and current time
            entry_number += 1
            current_time = start_time + duration
    
    # Write the output file
    with open(output_file_path, 'w') as output_file:
        output_file.write('\n'.join(srt_entries))
    
    print(f"Created YouTube SubRip Subtitle (SRT) format caption file: {output_file_path}")
    print(f"Total entries: {len(srt_entries)}")
    print(f"Total duration: {current_time}")

def format_srt_time(td):
    """Format a timedelta object as SubRip Subtitle (SRT) time format: HH:MM:SS,mmm"""
    # Get total seconds
    total_seconds = int(td.total_seconds())
    
    # Extract hours, minutes, seconds
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    seconds = total_seconds % 60
    
    # Get milliseconds (SRT uses commas instead of periods)
    milliseconds = int((td.total_seconds() - total_seconds) * 1000)
    
    # Format as HH:MM:SS,mmm
    return f"{hours:02d}:{minutes:02d}:{seconds:02d},{milliseconds:03d}"

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 3:
        print("Usage: py -m gen_captions video_catalog.log video_catalog.captions")
        sys.exit(1)
    
    log_file_path = sys.argv[1]
    output_file_path = sys.argv[2]
    
    log_to_srt_captions(log_file_path, output_file_path)