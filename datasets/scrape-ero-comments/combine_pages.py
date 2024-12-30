import json
from pathlib import Path
import argparse
import pandas as pd


def combine_pages(pages_path: Path, output_path: Path):
    """Combines the scraped data in an output folder into one file, and outputs that file in various formats."""

    # collect and combine comment page files
    comment_pages = [f for f in pages_path.glob("*.json")]
    comment_dfs = [
        pd.read_json(
            f,
            orient="index",
            convert_dates=False,
        ).assign(page_file=f.name)
        for f in comment_pages
    ]
    combined_dfs = pd.concat(comment_dfs).sort_index()
    # output to combined JSON and CSV
    try:
        combined_dfs.to_json(
            output_path / f"{pages_path.stem}.json",
            indent=4,
            orient="index",
        )
        combined_dfs.to_csv(output_path / f"{pages_path.stem}.csv")
    except ValueError as value_error:
        if ("DataFrame index must be unique for orient='index'" in str(value_error)):
            print(f"Duplicate indices found: {combined_dfs[combined_dfs.index.duplicated()]}")
        else:
            print("Exception occured when combining json files: ", value_error)
    except:
        print("Something went wrong combining json files")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Combine all the separated scraped .json files into one jso")
    parser.add_argument('--pages-path', type=str, required=True, help="The path to all the downloaded json")
    parser.add_argument('--output-path', type=str, required=True, help='The path to output the combined jsons')
    args = parser.parse_args()
    Path(args.pages_path).mkdir(parents=True, exist_ok=True)
    Path(args.output_path).mkdir(parents=True, exist_ok=True)
    pages_path = Path(args.pages_path)
    output_path = Path(args.output_path)
    combine_pages(pages_path=pages_path,output_path=output_path)