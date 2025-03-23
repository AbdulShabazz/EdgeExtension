import os
import struct
import binascii
import glob
import datetime

def get_mp4_duration(filename):
    """
    Extract the duration of an MP4 video file without external dependencies.
    Returns duration in seconds.
    """
    try:
        with open(filename, 'rb') as file:
            # Skip to the 'moov' atom
            # This is a very simplified approach that works for most standard MP4 files
            file.seek(0, os.SEEK_END)
            file_size = file.tell()
            file.seek(0)
            
            while True:
                if file.tell() >= file_size:
                    break
                
                # Read atom size and type
                try:
                    atom_size = struct.unpack('>I', file.read(4))[0]
                    atom_type = file.read(4).decode('ascii')
                    
                    if atom_type == 'moov':
                        # Found the moov atom, now look for mvhd
                        moov_end = file.tell() + atom_size - 8
                        
                        while file.tell() < moov_end:
                            try:
                                sub_size = struct.unpack('>I', file.read(4))[0]
                                sub_type = file.read(4).decode('ascii')
                                
                                if sub_type == 'mvhd':
                                    # Skip version and flags
                                    file.seek(4, os.SEEK_CUR)
                                    
                                    # Read creation time, modification time, and time scale
                                    _ = struct.unpack('>II', file.read(8))  # Skip creation and modification time
                                    time_scale = struct.unpack('>I', file.read(4))[0]
                                    
                                    # Read duration
                                    duration = struct.unpack('>I', file.read(4))[0]
                                    
                                    return duration / time_scale
                                else:
                                    # Skip to the next sub-atom
                                    file.seek(sub_size - 8, os.SEEK_CUR)
                            except:
                                break
                        
                        # If we got here, we didn't find mvhd in moov
                        break
                    else:
                        # Skip to the next atom
                        file.seek(atom_size - 8, os.SEEK_CUR)
                except:
                    break
    except Exception as e:
        print(f"Error processing {filename}: {e}")
    
    return 0  # Return 0 if duration couldn't be determined

def format_duration(seconds):
    """Convert seconds to HH:MM:SS format"""
    return str(datetime.timedelta(seconds=int(seconds)))

def catalog_videos(directory, output_file='video_catalog.log'):
    """
    Catalog all MP4 videos in the given directory and write the results to a log file.
    """
    # Get all MP4 files in the directory
    mp4_files = glob.glob(os.path.join(directory, '*.mp4')) # + glob.glob(os.path.join(directory, '*.MP4'))
    
    with open(output_file, 'w', encoding='utf-8') as log:
        for video_file in mp4_files:
            filename = os.path.basename(video_file)
            duration = get_mp4_duration(video_file)
            formatted_duration = format_duration(duration)
            
            # Write to log: filename, duration
            log.write(f"{filename}, {formatted_duration}\n")
            
            # Print progress
            print(f"Processed: {filename} - {formatted_duration}")
    
    print(f"\nCatalog complete! {len(mp4_files)} videos logged to {output_file}")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        directory = sys.argv[1]
        output_file = sys.argv[2] if len(sys.argv) > 2 else 'video_catalog.log'
        catalog_videos(directory, output_file)
    else:
        print("Usage: python video_catalog.py <directory> [output_file]")
        print("Example: python video_catalog.py ./my_videos videos.log")