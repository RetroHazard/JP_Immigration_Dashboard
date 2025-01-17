import os
import pandas as pd
import numpy as np
import dash
from dash import dcc, html
from dash.dependencies import Input, Output
import plotly.express as px
import matplotlib.pyplot as plt


# Load and clean the data
def load_and_clean_data(file_path):
    data = pd.read_csv(file_path)
    data.replace('***', '0', inplace=True)
    for col in ['総数', '既済_総数', '未済']:
        if col in data.columns:
            data[col] = pd.to_numeric(data[col].str.replace(',', ''), errors='coerce')
    return data


# Estimate result dates based on pending applications and processing rates
def estimate_result_date(data, application_month, application_type, immigration_bureau):
    # Print debug information
    print(f"Month: {application_month}, Type: {application_type}, Bureau: {immigration_bureau}")

    # Filter data
    filtered_data = data[
        (data['時間軸（月次）'] == application_month) &
        (data['在留資格審査'].isin(application_type if isinstance(application_type, list) else [application_type])) &
        (data['Immigration Bureau'].isin(
            immigration_bureau if isinstance(immigration_bureau, list) else [immigration_bureau]))
        ]

    # Calculate pending and processed applications
    pending = filtered_data[filtered_data['在留資格審査の受理・処理'] == '未済']['総数'].sum()
    processed = filtered_data[filtered_data['在留資格審査の受理・処理'] == '既済_総数']['総数'].sum()

    # Estimate processing time
    days_in_month = 30  # Approximation
    daily_rate = processed / days_in_month if processed > 0 else 0
    estimated_days = pending / daily_rate if daily_rate > 0 else float('inf')

    return estimated_days


# Initialize Dash app
app = dash.Dash(__name__)

# Load data from the 'data' folder
data_folder = os.path.join(os.getcwd(), "data")
data_file = os.path.join(data_folder, "FEH_00250011_250116115013.csv")
data = load_and_clean_data(data_file)

# Prepare data for visualization
data_melted = data.melt(
    id_vars=['表章項目', '時間軸（月次）', '在留資格審査', '在留資格審査の受理・処理'],
    var_name='Immigration Bureau',
    value_name='Count'
)

# Dashboard layout
app.layout = html.Div([
    html.H1("Immigration Application Dashboard"),

    # Filters
    html.Div([
        html.Label("Filter by Immigration Bureau:"),
        dcc.Dropdown(
            id='bureau-filter',
            options=[{'label': b, 'value': b} for b in data_melted['Immigration Bureau'].unique() if pd.notna(b)],
            value=None,
            multi=True,
        ),
        html.Label("Filter by Application Type:"),
        dcc.Dropdown(
            id='application-type-filter',
            options=[{'label': t, 'value': t} for t in data_melted['在留資格審査'].unique()],
            value=None,
            multi=True,
        ),
        html.Label("Select Month:"),
        dcc.Dropdown(
            id='month-filter',
            options=[{'label': m, 'value': m} for m in data_melted['時間軸（月次）'].unique()],
            value=None,
        ),
    ]),

    # Graphs and estimation output
    dcc.Graph(id='application-graph'),
    html.Div(id='result-estimation-output'),
])


# Callbacks to update graph and estimation output
@app.callback(
    [Output('application-graph', 'figure'),
     Output('result-estimation-output', 'children')],
    [Input('bureau-filter', 'value'),
     Input('application-type-filter', 'value'),
     Input('month-filter', 'value')]
)
def update_dashboard(selected_bureaus, selected_types, selected_month):
    filtered_data = data_melted.copy()

    if selected_bureaus:
        filtered_data = filtered_data[filtered_data['Immigration Bureau'].isin(selected_bureaus)]

    if selected_types:
        filtered_data = filtered_data[filtered_data['在留資格審査'].isin(selected_types)]

    fig = px.bar(filtered_data, x='時間軸（月次）', y='Count', color='在留資格審査',
                 barmode='group', title="Immigration Applications")

    # Estimate result date if a month is selected
    if selected_month:
        estimated_days = estimate_result_date(data, selected_month, selected_types, selected_bureaus)
        estimation_text = f"Estimated days to process pending applications for {selected_month}: {estimated_days:.2f} days"
    else:
        estimation_text = "Select a month to estimate result dates."

    return fig, estimation_text


# Run the app
if __name__ == '__main__':
    app.run_server(debug=False)
