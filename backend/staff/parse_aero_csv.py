"""
Module for reading aerodynamic CSV files with metadata and data tables.

This module provides functions to parse CSV files that contain metadata
key-value pairs followed by a data table marked by a '<Start>' line.

Example file structure:
    Tipe = Calculation = Расчет
    Source = FloEFD
    ...
    <Start>
    M Alpha Fi Cxa Cya mz K Cx Cy Cx2 Cy2 C2 C Cd mz1
    0.3 0 0 0.7848 -0.0006 -0.0003 ...

Functions:
    read_aero_csv(filepath) -> (metadata_dict, data_list_of_dicts)
    read_aero_csv_as_dataframe(filepath) -> pandas.DataFrame (if pandas installed)
"""

import csv
from collections import OrderedDict
from datetime import datetime

from logger.setup import logger


def parse_content_csv(content: str):
    """Parse aero CSV file with metadata and data.

    Args:
        content (str): content CSV file.
    Returns:
        tuple: (metadata_dict, data_list_of_dicts)
            metadata_dict: Ordered dictionary of key-value pairs from the header.
            data_list_of_dicts: List of dictionaries, each representing a data row
                with column names as keys and numeric values as floats.

    Raises:
        ValueError: If the file does not contain a '<Start>' marker.
        FileNotFoundError: If the file does not exist.
    """
    lines = content.split("\n")
    metadata = OrderedDict()
    data_start = None
    for i, line in enumerate(lines):
        if line.strip() == '<Start>':
            data_start = i + 1  # next line is header
            break
        if '=' in line:
            parts = line.split('=', 1)
            key = parts[0].strip()
            value = parts[1].strip()
            metadata[key] = value
        # ignore empty lines or other non-metadata lines

    if data_start is None:
        raise ValueError("No '<Start>' marker found in file")
    
    if "Date" in metadata:
        mdate = metadata["Date"]
        try:
            mdate = datetime.strptime(mdate, "%d.%m.%Y")  # noqa: DTZ007
        except Exception as e:
            logger.error(e)
            mdate = None
        metadata["Date"] = mdate

    # header line
    header_line = lines[data_start]
    reader = csv.reader([header_line], delimiter=' ', skipinitialspace=True)
    header = next(reader)

    # data lines
    data_lines = lines[data_start + 1:]
    data = []
    for line in data_lines:
        if not line.strip():
            continue
        reader = csv.reader([line], delimiter=' ', skipinitialspace=True)
        row = next(reader)
        if len(row) != len(header):
            # skip malformed rows, but could log a warning
            continue
        # convert numeric values
        converted = []
        for val in row:
            try:
                converted.append(float(val))
            except ValueError:
                converted.append(val)
        data.append(dict(zip(header, converted)))

    return metadata, data
