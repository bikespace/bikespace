from bs4 import BeautifulSoup


def pretty_print_html(text: str) -> None:  # pragma: no cover
    """
    Take a text string of HTML (e.g. from a request's .text property), pretty-print with beautifulsoup and print to the console.

    How to use: add
    ```python
    from bikespace_api.tests.utilities import pretty_print_html
    ```
    to your imports and then you can call the function inside a test or while using a breakpoint().
    """
    soup = BeautifulSoup(text, "html.parser")
    print(soup.prettify())
