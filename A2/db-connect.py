import pandas as pd
import psycopg2
import numpy as np
import json
from psycopg2.extras import execute_values
from datetime import datetime


# TYPE INFERENCE FUNCTION

def infer_postgres_type(series: pd.Series):
    dtype = series.dtype

    if pd.api.types.is_integer_dtype(dtype):
        # check range for integer vs bigint
        if series.min() >= -2147483648 and series.max() <= 2147483647:
            return "INTEGER"
        return "BIGINT"

    elif pd.api.types.is_float_dtype(dtype):
        return "DOUBLE PRECISION"

    elif pd.api.types.is_bool_dtype(dtype):
        return "BOOLEAN"

    elif pd.api.types.is_datetime64_any_dtype(dtype):
        return "TIMESTAMP"

    elif pd.api.types.is_categorical_dtype(dtype):
        return "TEXT"

    elif pd.api.types.is_object_dtype(dtype):
        # detect JSON
        sample = series.dropna().iloc[0] if not series.dropna().empty else None

        if isinstance(sample, (dict, list)):
            return "JSONB"
        else:
            return "TEXT"

    else:
        return "TEXT"


# CREATE TABLE DYNAMICALLY

def create_table_from_df(cursor, table_name, df):
    columns = []

    for col in df.columns:
        pg_type = infer_postgres_type(df[col])
        columns.append(f'"{col}" {pg_type}')

    create_query = f"""
    CREATE TABLE IF NOT EXISTS "{table_name}" (
        {", ".join(columns)}
    );
    """

    cursor.execute(create_query)


# ----------------------------------------
# INSERT DATA
# ----------------------------------------

def convert_numpy_to_python(value):
    if isinstance(value, (np.integer,)):
        return int(value)
    elif isinstance(value, (np.floating,)):
        return float(value)
    elif isinstance(value, (np.bool_,)):
        return bool(value)
    elif pd.isna(value):
        return None
    else:
        return value


def insert_dataframe(cursor, table_name, df):
    df_copy = df.copy()

    # Convert JSON columns
    for col in df_copy.columns:
        if df_copy[col].dtype == "object":
            df_copy[col] = df_copy[col].apply(
                lambda x: json.dumps(x) if isinstance(x, (dict, list)) else x
            )

    # Convert everything to native Python types
    records = [
        tuple(convert_numpy_to_python(value) for value in row)
        for row in df_copy.to_numpy()
    ]

    cols = ', '.join([f'"{col}"' for col in df_copy.columns])

    insert_query = f"""
        INSERT INTO "{table_name}" ({cols})
        VALUES %s;
    """

    execute_values(cursor, insert_query, records)


# MAIN FUNCTION

def get_existing_data(cursor, table_name, df):
    """Fetch existing data from table to compare with new data"""
    try:
        # Check if table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = %s
            );
        """, (table_name,))
        
        table_exists = cursor.fetchone()[0]
        
        if not table_exists:
            return pd.DataFrame()  # Empty dataframe if table doesn't exist
        
        # Get all data from existing table
        cols = ', '.join([f'"{col}"' for col in df.columns])
        cursor.execute(f'SELECT {cols} FROM "{table_name}"')
        
        existing_data = cursor.fetchall()
        existing_df = pd.DataFrame(existing_data, columns=df.columns)
        
        return existing_df
    except Exception as e:
        print(f"Note: Could not fetch existing data: {e}")
        return pd.DataFrame()


def get_new_rows(df, existing_df):
    """Compare dataframes and return only new rows"""
    if existing_df.empty:
        return df
    
    # Merge and find rows that don't exist in existing data
    merged = df.merge(existing_df, how='left', indicator=True)
    new_rows = merged[merged['_merge'] == 'left_only'].drop('_merge', axis=1)
    
    return new_rows


def upload_dataframe_to_postgres(df, table_name, conn_params, incremental=True):
    """Upload dataframe to PostgreSQL with optional incremental update"""
    conn = psycopg2.connect(**conn_params)
    cursor = conn.cursor()

    create_table_from_df(cursor, table_name, df)
    
    if incremental:
        # Get existing data and find new rows only
        existing_df = get_existing_data(cursor, table_name, df)
        new_data = get_new_rows(df, existing_df)
        
        if new_data.empty:
            print(f"No new rows to insert for table '{table_name}'")
        else:
            print(f"Inserting {len(new_data)} new rows (out of {len(df)} total rows)")
            insert_dataframe(cursor, table_name, new_data)
    else:
        # Insert all data without checking
        insert_dataframe(cursor, table_name, df)

    conn.commit()
    cursor.close()
    conn.close()

    print(f"Upload completed successfully for table '{table_name}'!")



if __name__ == "__main__":

    # Example dataframe
    df = pd.DataFrame({
        "id": [1, 2, 3],
        "name": ["Alice", "Bob", "Charlie"],
        "age": [25, 30, 35],
        "salary": [50000.5, 60000.0, 70000.75],
        "is_active": [True, False, True],
        "join_date": pd.to_datetime(["2020-01-01", "2021-02-01", "2022-03-01"]),
        "metadata": [{"level": "senior"}, {"level": "junior"}, {"level": "mid"}]
    })

    connection_parameters = {
        "dbname": "automation_db",
        "user": "postgres",
        "password": "2606",
        "host": "localhost",
        "port": "5432"
    }

    upload_dataframe_to_postgres(df, "dynamic_table", connection_parameters)
