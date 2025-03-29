#!/usr/bin/env python3
"""
02_combine_all_captions.py

This script finds all YouTube caption files in the format 'video_catalog(_\d+)*\.captions'
and combines them in the order they were received, adjusting timestamps accordingly.
"""

import os
import re
import itertools
from datetime import datetime, timedelta
import argparse
import sys

def find_caption_files(directory='.'):
    """
    Find all files matching the pattern 'video_catalog(_\d+)*\.captions' in the given directory.
    
    Args:
        directory (str): Directory to search for caption files
        
    Returns:
        list: A list of matching filenames
    """
    pattern = r'video_catalog(?:_\d+)*\.captions'
    
    # Get all files in the directory
    all_files = os.listdir(directory)
    
    # Filter files matching the pattern
    caption_files = [f for f in all_files if re.match(pattern, f)]
    
    return caption_files

def sort_caption_files(files):
    """
    Sort caption files based on creation time.
    
    Args:
        files (list): List of filenames to sort
        
    Returns:
        list: Sorted list of filenames
    """
    # Create a list of tuples (filename, creation_time)
    file_times = [(f, os.path.getctime(f)) for f in files]
    
    # Sort by creation time
    sorted_files = [f for f, _ in sorted(file_times, key=lambda x: x[1])]
    
    return sorted_files

def parse_srt_timestamp(timestamp_str):
    """
    Parse an SRT timestamp in the format HH:MM:SS,mmm
    
    Args:
        timestamp_str (str): SRT timestamp string
        
    Returns:
        timedelta: Timestamp as timedelta object
    """
    # Handle potential formatting issues
    timestamp_str = timestamp_str.strip().replace(' ', '')
    
    # Split hours, minutes, seconds and milliseconds
    time_parts = timestamp_str.replace(',', ':').split(':')
    
    if len(time_parts) == 4:  # HH:MM:SS,mmm
        hours, minutes, seconds, milliseconds = map(int, time_parts)
    elif len(time_parts) == 3:  # MM:SS,mmm (missing hours)
        minutes, seconds, milliseconds = map(int, time_parts)
        hours = 0
    else:
        raise ValueError(f"Invalid SRT timestamp format: {timestamp_str}")
        
    return timedelta(hours=hours, minutes=minutes, seconds=seconds, milliseconds=milliseconds)

def format_srt_timestamp(td):
    """
    Format a timedelta object as an SRT timestamp (HH:MM:SS,mmm)
    
    Args:
        td (timedelta): Timestamp as timedelta
        
    Returns:
        str: Formatted SRT timestamp
    """
    # Calculate components
    total_seconds = int(td.total_seconds())
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    seconds = total_seconds % 60
    milliseconds = td.microseconds // 1000
    
    return f"{hours:02d}:{minutes:02d}:{seconds:02d},{milliseconds:03d}"

def combine_caption_files(files, output_file='combined_captions.captions'):
    """
    Combine SRT caption files, adjusting timestamps to be continuous.
    
    Args:
        files (list): List of caption filenames to combine
        output_file (str): Output filename for combined captions
        
    Returns:
        bool: True if successful, False otherwise
    """
    if not files:
        print("No caption files to combine.")
        return False
        
    combined_lines = []
    current_index = 1  # SRT index counter for the combined file
    time_offset = timedelta(0)  # Initial time offset
    
    for file_index, file in enumerate(files):
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Skip empty files
            if not content.strip():
                print(f"Warning: File {file} is empty, skipping.")
                continue
                
            # Parse the SRT file
            blocks = re.split(r'\n\s*\n', content.strip())
            last_end_time = None
            
            for block in blocks:
                lines = block.strip().split('\n')
                if len(lines) < 3:
                    continue  # Skip invalid blocks
                
                # Extract timestamp line
                timestamp_line = lines[1]
                timestamp_match = re.match(r'(\d+:\d+:\d+,\d+)\s*-->\s*(\d+:\d+:\d+,\d+)', timestamp_line)
                
                if not timestamp_match:
                    continue  # Skip invalid timestamp lines
                
                start_time_str, end_time_str = timestamp_match.groups()
                
                # Parse timestamps
                start_time = parse_srt_timestamp(start_time_str)
                end_time = parse_srt_timestamp(end_time_str)
                
                # Apply offset
                adjusted_start_time = start_time + time_offset
                adjusted_end_time = end_time + time_offset
                
                # Format adjusted timestamps
                adjusted_timestamp_line = f"{format_srt_timestamp(adjusted_start_time)} --> {format_srt_timestamp(adjusted_end_time)}"
                
                # Add adjusted block to combined content
                adjusted_block = [
                    str(current_index),
                    adjusted_timestamp_line
                ] + lines[2:]
                
                combined_lines.append('\n'.join(adjusted_block))
                combined_lines.append('')  # Empty line between blocks
                
                current_index += 1
                last_end_time = end_time
            
            # Update offset for the next file based on the last subtitle's end time
            if last_end_time is not None and file_index < len(files) - 1:
                time_offset += last_end_time
                
        except Exception as e:
            print(f"Error processing file {file}: {e}")
            return False
    
    # Write combined content to output file
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(combined_lines))
        print(f"Successfully combined {len(files)} caption files into {output_file}")
        return True
    except Exception as e:
        print(f"Error writing to output file {output_file}: {e}")
        return False

def main():
    """Main function to execute the script."""
    # Set up argument parser
    parser = argparse.ArgumentParser(description='Combine YouTube caption files.')
    parser.add_argument('-d', '--directory', default='./', help='Directory to search for caption files')
    parser.add_argument('-o', '--output', default='combined_captions.captions', help='Output filename')
    parser.add_argument('-v', '--verbose', action='store_true', help='Show verbose output')
    
    args = parser.parse_args()
    
    # Find caption files
    caption_files = find_caption_files(args.directory)
    
    if not caption_files:
        print("No caption files found matching the pattern 'video_catalog(_\\d+)*\\.captions'")
        return
    
    if args.verbose:
        print(f"Found {len(caption_files)} caption files:")
        for file in caption_files:
            print(f"  - {file}")
    
    # Sort caption files by creation time
    sorted_files = sort_caption_files(caption_files)
    
    if args.verbose:
        print("\nFiles will be combined in this order:")
        for i, file in enumerate(sorted_files, 1):
            creation_time = datetime.fromtimestamp(os.path.getctime(file))
            print(f"  {i}. {file} (created: {creation_time})")
    
    # Combine caption files
    success = combine_caption_files(sorted_files, args.output)
    
    if success:
        if args.verbose:
            print(f"\nCaptions successfully combined into {args.output}")
            print(f"Total size: {os.path.getsize(args.output)} bytes")
            
        # Print the first few blocks of the output file
        try:
            with open(args.output, 'r', encoding='utf-8') as f:
                preview_lines = list(itertools.islice(f, 15))  # Show first few subtitle blocks
                if args.verbose and preview_lines:
                    print("\nPreview of the combined file:")
                    for line in preview_lines:
                        print(f"  {line.rstrip()}")
        except Exception as e:
            if args.verbose:
                print(f"Could not preview output file: {e}")

if __name__ == "__main__":
    main()