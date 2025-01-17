import pandas as pd
import streamlit as st
import matplotlib.pyplot as plt
import datetime
import numpy as np
from dateutil.parser import parse
import japanize_matplotlib
import seaborn as sns


class ImmigrationProcessor:
    def __init__(self, file_path):
        self.data = pd.read_csv(file_path)
        self.process_data()

    def process_data(self):
        # Replace missing values
        self.data = self.data.replace('***', '0')

        # Convert numeric columns
        numeric_cols = self.data.columns[5:]
        self.data[numeric_cols] = self.data[numeric_cols].apply(
            lambda x: pd.to_numeric(x.str.replace(',', ''), errors='coerce')
        )

        # Parse dates
        self.data['時間軸（月次）'] = pd.to_datetime(
            self.data['時間軸（月次）'].str.replace('年', '-').str.replace('月', '-01')
        )

    def get_unique_values(self, column):
        return sorted(self.data[column].unique())

    def get_bureaus(self):
        return [col for col in self.data.columns if '支局' in col or '管内' in col]

    def filter_data(self, start_date=None, end_date=None):
        # Create pivot table
        pivot_data = pd.pivot_table(
            self.data,
            values='総数',
            index='時間軸（月次）',
            columns='在留資格審査の受理・処理',
            aggfunc='sum'
        )

        # Apply filters
        if start_date:
            pivot_data = pivot_data[pivot_data.index >= start_date]
        if end_date:
            pivot_data = pivot_data[pivot_data.index <= end_date]

        return pivot_data


class ImmigrationDashboard:
    def __init__(self):
        self.processor = ImmigrationProcessor('data/FEH_00250011_250116115013.csv')
        self.setup_page()

    def setup_page(self):
        st.set_page_config(
            page_title="Immigration Application Dashboard",
            layout="wide"
        )

        # Language selection
        self.lang = self.language_selector()

        # Main title
        st.title(self.get_text('title'))

        # Sidebar filters
        self.setup_sidebar()

        # Main content
        self.show_main_content()

    def language_selector(self):
        langs = {
            '日本語': 'ja',
            'English': 'en'
        }
        selected = st.sidebar.selectbox(
            'Language / 言語',
            options=list(langs.keys())
        )
        return langs[selected]

    def get_text(self, key):
        texts = {
            'ja': {
                'title': '在留資格申請データダッシュボード',
                'filters': 'フィルター設定',
                'period': '期間',
                'total': '総申請数',
                'monthly_avg': '月間平均',
                'details': 'データ詳細',
                'applications': '申請件数'
            },
            'en': {
                'title': 'Immigration Application Dashboard',
                'filters': 'Filter Settings',
                'period': 'Period',
                'total': 'Total Applications',
                'monthly_avg': 'Monthly Average',
                'details': 'Detailed Data',
                'applications': 'Number of Applications'
            }
        }
        return texts[self.lang][key]

    def setup_sidebar(self):
        st.sidebar.header(self.get_text('filters'))

        # Date range
        dates = self.processor.get_unique_values('時間軸（月次）')
        self.start_date, self.end_date = st.sidebar.select_slider(
            self.get_text('period'),
            options=dates,
            value=(min(dates), max(dates))
        )

    def show_main_content(self):
        # Get filtered data
        filtered_data = self.processor.filter_data(
            self.start_date,
            self.end_date
        )

        # Create visualization
        fig, ax = plt.subplots(figsize=(15, 8))

        # Plot stacked bar chart
        filtered_data.plot(
            kind='bar',
            stacked=True,
            ax=ax,
            width=0.8,
            colormap='tab20'
        )

        # Customize x-axis
        plt.xticks(
            range(len(filtered_data.index)),
            filtered_data.index.strftime('%Y-%m'),
            rotation=45,
            ha='right'
        )

        plt.yticks(
            range(0, 100000, 5000),
            minor=True,
            rotation=0,
            ha='right'
        )

        plt.title(self.get_text('title'))
        plt.xlabel(self.get_text('period'))
        plt.ylabel(self.get_text('applications'))
        plt.legend(title='Application Status', bbox_to_anchor=(1.05, 1), loc='upper left')
        plt.tight_layout()

        # Display plot
        st.pyplot(fig)

        # Show metrics
        self.show_metrics(filtered_data)

        # Show data table
        st.subheader(self.get_text('details'))
        st.dataframe(filtered_data)

    def show_metrics(self, data):
        col1, col2 = st.columns(2)

        with col1:
            st.metric(
                self.get_text('total'),
                f"{data.sum().sum():,}"
            )

        with col2:
            st.metric(
                self.get_text('monthly_avg'),
                f"{data.sum().sum() / len(data):,.0f}"
            )


if __name__ == "__main__":
    dashboard = ImmigrationDashboard()
