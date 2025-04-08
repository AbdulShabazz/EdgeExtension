def parse_timestamp(timestamp):
    """Convert a timestamp in format 'MM:SS' to seconds."""
    minutes, seconds = timestamp.split(':')
    return int(minutes) * 60 + int(seconds)

def format_srt_time(seconds):
    """Convert seconds to SRT time format: 00:00:00,000."""
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    millisecs = 0
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millisecs:03d}"

def generate_srt(toc_lines, duration=2):
    """Generate SRT entries from TOC lines with specified duration."""
    srt_entries = []
    
    for i, line in enumerate(toc_lines, 1):
        # Parse the line
        parts = line.strip().split(' - ', 1)
        if len(parts) != 2:
            continue
            
        timestamp, title = parts
        start_time = parse_timestamp(timestamp)
        end_time = start_time + duration
        
        # Format the SRT entry
        entry = f"{i}\n"
        entry += f"{format_srt_time(start_time)} --> {format_srt_time(end_time)}\n"
        entry += f"{title}\n\n"
        
        srt_entries.append(entry)
    
    return ''.join(srt_entries)

def toc_to_srt(toc_filename="video_details.toc", srt_filename="video_details.captions", duration=2):
    """Convert TOC file to SRT file."""
    try:
        with open(toc_filename, 'r', encoding='utf-8') as toc_file:
            toc_lines = toc_file.readlines()
        
        srt_content = generate_srt(toc_lines, duration)
        
        with open(srt_filename, 'w', encoding='utf-8') as srt_file:
            srt_file.write(srt_content)
            
        print(f"Successfully converted {toc_filename} to {srt_filename}")
        return True
    
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    import sys
    
    toc_file = "video_details.toc"
    srt_file = "video_details.captions"
    duration = 2
    
    # Parse command line arguments
    if len(sys.argv) > 1:
        toc_file = sys.argv[1]
    if len(sys.argv) > 2:
        srt_file = sys.argv[2]
    if len(sys.argv) > 3:
        try:
            duration = int(sys.argv[3])
        except ValueError:
            print(f"Invalid duration: {sys.argv[3]}. Using default duration of 2 seconds.")
    
    toc_to_srt(toc_file, srt_file, duration)