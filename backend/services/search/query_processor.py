"""
query_processor.py
------------------
Transforms a raw user query string into a PostgreSQL tsquery-compatible string
using spaCy for tokenization, stop-word removal, and lemmatization.

Example:
    >>> process_query("climate change datasets from 2023")
    'climat & chang & dataset'
"""

import spacy

# Load the model once at module level — avoids repeated disk I/O per request.
# Make sure 'en_core_web_sm' is installed:
#   python -m spacy download en_core_web_sm
_nlp = spacy.load("en_core_web_sm")


def process_query(raw: str) -> str:
    """
    Process a raw search query into a PostgreSQL tsquery string.

    Steps:
      1. Parse the query with spaCy.
      2. Drop stop words, punctuation, whitespace, and very short tokens (< 2 chars).
      3. Lemmatize each remaining token.
      4. Join with ' & ' for use with to_tsquery() / plainto_tsquery().

    Args:
        raw: The raw query string from the user.

    Returns:
        A tsquery-safe string (e.g. "climat & chang & data"), or an empty
        string if nothing meaningful remains after filtering.
    """
    if not raw or not raw.strip():
        return ""

    doc = _nlp(raw.strip().lower())

    tokens = [
        token.lemma_
        for token in doc
        if not token.is_stop
        and not token.is_punct
        and not token.is_space
        and len(token.lemma_) >= 2
    ]

    return " & ".join(tokens)


def get_search_terms(raw: str) -> list[str]:
    """
    Returns the list of processed tokens without joining.
    Useful for highlighting or debugging.

    Args:
        raw: The raw query string.

    Returns:
        List of lemmatized, filtered tokens.
    """
    if not raw or not raw.strip():
        return []

    doc = _nlp(raw.strip().lower())

    return [
        token.lemma_
        for token in doc
        if not token.is_stop
        and not token.is_punct
        and not token.is_space
        and len(token.lemma_) >= 2
    ]
