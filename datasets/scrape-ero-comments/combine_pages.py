import json
from pathlib import Path
import argparse
import pandas as pd

def combine_pages(pages_path: Path, output_path: Path):
    """Combines the scraped data in an output folder into one file, and outputs that file in various formats."""
    comment_pages = list(pages_path.glob("*.json"))
    if not comment_pages:
        print(f"No JSON files found in {pages_path}, skipping.")
        return

    comment_dfs = []
    for f in comment_pages:
        try:
            df = pd.read_json(f, orient="index", convert_dates=False)
            df = df.assign(page_file=f.name)
            comment_dfs.append(df)
        except ValueError as e:
            print(f"Error reading JSON {f}: {e}")

    if not comment_dfs:
        print(f"No valid data frames found in {pages_path}, skipping.")
        return

    combined_dfs = pd.concat(comment_dfs).sort_index()

    try:
        combined_dfs.to_json(
            output_path / f"{pages_path.name}.json",
            indent=4,
            orient="index",
        )
        combined_dfs.to_csv(output_path / f"{pages_path.name}.csv")
        print(f"Combined files from {pages_path} into {pages_path.name}.json and {pages_path.name}.csv")
    except ValueError as value_error:
        if "DataFrame index must be unique for orient='index'" in str(value_error):
            dups = combined_dfs[combined_dfs.index.duplicated()]
            print(f"Duplicate indices found:\n{dups}")
        else:
            print("Exception occurred when combining JSON files:", value_error)
    except Exception as e:
        print("Something went wrong combining JSON files:", e)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Combine .json files from multiple subdirectories into consolidated files."
    )
    parser.add_argument('--pages-path', type=str, required=True,
                        help="Path to the directory that contains multiple subdirectories with .json files.")
    parser.add_argument('--output-path', type=str, required=True,
                        help='Path to store the combined .json and .csv files for each subdirectory.')
    args = parser.parse_args()

    # Ensure the main paths exist
    pages_base = Path(args.pages_path)
    output_base = Path(args.output_path)
    pages_base.mkdir(parents=True, exist_ok=True)
    output_base.mkdir(parents=True, exist_ok=True)

    # Iterate over each subdirectory inside pages_base
    for subdir in pages_base.iterdir():
        if subdir.is_dir():
            combine_pages(pages_path=subdir, output_path=output_base)

