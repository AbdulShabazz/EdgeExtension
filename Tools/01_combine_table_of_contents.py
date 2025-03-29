#!/usr/bin/env python3
"""
02_combine_chapters.py

This script finds all YouTube chapter timestamp files in the format 'video_catalog(_\d+)*\.toc'
and combines them in the order they were received.
"""

import os
import re
import glob
import itertools
from datetime import datetime
import argparse
import sys

def find_chapter_files(directory='.'):
    """
    Find all files matching the pattern 'video_catalog(_\d+)*\.toc' in the given directory.
    
    Args:
        directory (str): Directory to search for chapter files
        
    Returns:
        list: A list of matching filenames
    """
    pattern = r'video_catalog(?:_\d+)*\.toc'
    
    # Get all files in the directory
    all_files = os.listdir(directory)
    
    # Filter files matching the pattern
    chapter_files = [f for f in all_files if re.match(pattern, f)]
    
    return chapter_files

def sort_chapter_files(files):
    """
    Sort chapter files based on creation time.
    
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

def parse_timestamp(timestamp):
    """
    Parse a timestamp in the format HH:MM:SS or MM:SS into seconds.
    
    Args:
        timestamp (str): Timestamp string
        
    Returns:
        int: Total seconds
    """
    parts = timestamp.strip().split(':')
    if len(parts) == 3:  # HH:MM:SS
        hours, minutes, seconds = map(int, parts)
        return hours * 3600 + minutes * 60 + seconds
    elif len(parts) == 2:  # MM:SS
        minutes, seconds = map(int, parts)
        return minutes * 60 + seconds
    else:
        raise ValueError(f"Invalid timestamp format: {timestamp}")

def format_timestamp(seconds):
    """
    Format seconds into HH:MM:SS format.
    
    Args:
        seconds (int): Total seconds
        
    Returns:
        str: Formatted timestamp
    """
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    
    return f"{hours:02d}:{minutes:02d}:{secs:02d}"

def combine_chapters(files, output_file='combined_chapters.txt'):
    """
    Combine chapter content from files in the given order,
    adjusting timestamps to be continuous across files.
    
    Args:
        files (list): List of filenames to combine
        output_file (str): Output filename for combined content
        
    Returns:
        bool: True if successful, False otherwise
    """
    combined_content = []
    current_offset = 0  # Offset in seconds
    
    # Process each file
    for file_index, file in enumerate(files):
        try:
            with open(file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                
            if not lines:
                continue
                
            # Find the last timestamp in this file to calculate the offset for the next file
            last_timestamp = None
            adjusted_lines = []
            
            for line in lines:
                line = line.strip()
                if not line:
                    adjusted_lines.append(line)
                    continue
                    
                # Try to parse line as a chapter timestamp entry
                # Common format: "00:00 Chapter Title" or "00:00:00 Chapter Title"
                match = re.match(r'^(\d+:\d+(?::\d+)?)[ \t]+(.+)')                
                
                if match:
                    timestamp_str, chapter_title = match.groups()
                    timestamp_seconds = parse_timestamp(timestamp_str)
                    
                    # Adjust the timestamp with the current offset
                    adjusted_timestamp_seconds = timestamp_seconds + current_offset
                    adjusted_timestamp = format_timestamp(adjusted_timestamp_seconds)
                    
                    # Update the last timestamp
                    last_timestamp = timestamp_seconds
                    
                    # Create adjusted line
                    adjusted_line = f"{adjusted_timestamp} {chapter_title}"
                    adjusted_lines.append(adjusted_line)
                else:
                    # Keep non-timestamp lines as is
                    adjusted_lines.append(line)
            
            # Add file content with adjusted timestamps
            if adjusted_lines:
                #combined_content.append(f"# From {file}")
                combined_content.extend(adjusted_lines)
                #combined_content.append("")  # Add empty line between files
            
            # If this isn't the last file, update offset for the next file
            if file_index < len(files) - 1 and last_timestamp is not None:
                current_offset += last_timestamp
                
        except Exception as e:
            print(f"Error processing file {file}: {e}")
            return False
    
    # Write combined content to output file
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("\n".join(combined_content))
        print(f"Successfully combined {len(files)} chapter files into {output_file}")
        return True
    except Exception as e:
        print(f"Error writing to output file {output_file}: {e}")
        return False

def main():
    """Main function to execute the script."""
    # Set up argument parser
    parser = argparse.ArgumentParser(description='Combine YouTube chapter timestamp files.')
    parser.add_argument('-d', '--directory', default='./', help='Directory to search for chapter files')
    parser.add_argument('-o', '--output', default='video_catalog_long.toc', help='Output filename')
    parser.add_argument('-v', '--verbose', action='store_true', help='Show verbose output')
    
    args = parser.parse_args()
    
    # Find chapter files
    chapter_files = find_chapter_files(args.directory)
    
    if not chapter_files:
        print("No Youtube SRT chapter filenames found matching the pattern 'video_catalog(_\\d+)*\\.toc'")
        return
    
    if args.verbose:
        print(f"Found {len(chapter_files)} chapter files:")
        for file in chapter_files:
            print(f"  - {file}")
    
    # Sort chapter files by creation time
    sorted_files = sort_chapter_files(chapter_files)
    
    if args.verbose:
        print("\nFiles will be combined in this order:")
        for i, file in enumerate(sorted_files, 1):
            creation_time = datetime.fromtimestamp(os.path.getctime(file))
            print(f"  {i}. {file} (created: {creation_time})")
    
    # Combine chapter files
    success = combine_chapters(sorted_files, args.output)
    
    if success:
        if args.verbose:
            print(f"\nContent successfully combined into {args.output}")
            print(f"Total size: {os.path.getsize(args.output)} bytes")
            
        # Print the first few lines of the output file
        try:
            with open(args.output, 'r', encoding='utf-8') as f:
                preview_lines = list(itertools.islice(f, 10))
                if args.verbose and preview_lines:
                    print("\nPreview of the combined file:")
                    for line in preview_lines:
                        print(f"  {line.strip()}")
        except Exception as e:
            if args.verbose:
                print(f"Could not preview output file: {e}")

if __name__ == "__main__":
    main()