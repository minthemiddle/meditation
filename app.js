function app() {
    const typeColors = {
      Sitting: 'rgba(0, 128, 255, 1)',
      Walking: 'rgba(255, 165, 0, 1)',
      Bodyscan: 'rgba(34, 139, 34, 1)',
      Other: 'rgba(128, 0, 128, 1)',
    };
  
    return {
      datetime: getCurrentDateTime(),
      duration: 0,
      type: 'Sitting',
      comment: '',
      entries: [],
      chart: null,
      localStorageData: '',
  
      loadData() {
        const data = JSON.parse(localStorage.getItem('meditation_sessions') || '[]');
        this.entries = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        this.updateChart();
        this.loadLocalStorageData(); // Load the LocalStorage data on initialization
      },
  
      saveEntry() {
        if (this.duration <= 0) {
          return;
        }
        const timestamp = this.datetime;
        const entry = {
          id: Date.now(),
          timestamp,
          duration: parseInt(this.duration),
          type: this.type,
          comment: this.comment,
        };
        this.entries.unshift(entry);
        this.saveToLocalStorage();
        this.resetForm();
      },
  
      editEntry(id) {
        const entry = this.entries.find(e => e.id === id);
        if (entry) {
          this.datetime = entry.timestamp;
          this.duration = entry.duration;
          this.type = entry.type;
          this.comment = entry.comment;
          this.deleteEntry(id);
        }
      },
  
      deleteEntry(id) {
        this.entries = this.entries.filter(entry => entry.id !== id);
        this.saveToLocalStorage();
      },
  
      resetForm() {
        this.datetime = getCurrentDateTime();
        this.duration = 0;
        this.type = 'Sitting';
        this.comment = '';
      },

      loadLocalStorageData() {
        const data = JSON.stringify(this.entries, null, 2);
        this.localStorageData = data;
      },

      saveLocalStorageData() {
        try {
          const parsedData = JSON.parse(this.localStorageData);
          localStorage.setItem('meditation_sessions', JSON.stringify(parsedData));
          this.loadData(); // Re-load the data to update the chart and table
          alert('LocalStorage data updated successfully.');
        } catch (error) {
          alert('Invalid JSON data. Please check the format and try again.');
        }
      },

      saveToLocalStorage() {
        localStorage.setItem('meditation_sessions', JSON.stringify(this.entries));
        this.updateChart();
      },
  
      updateChart() {
        if (this.chart) {
          this.chart.destroy();
        }
  
        const data = this.entries.reduce((acc, entry) => {
          const date = entry.timestamp.slice(0, 10);
          if (!acc.labels.includes(date)) {
            acc.labels.push(date);
            acc.data.push({});
          }
          const index = acc.labels.indexOf(date);
          if (!acc.data[index][entry.type]) {
            acc.data[index][entry.type] = 0;
          }
          acc.data[index][entry.type] += entry.duration;
          return acc;
        }, { labels: [], data: [] });
  
        // Sort the data by date before rendering the chart
        const sortedData = data.labels.map((label, index) => ({
          label,
          data: data.data[index],
        })).sort((a, b) => new Date(a.label) - new Date(b.label));
  
        const datasets = Object.keys(typeColors).map(type => ({
          label: type,
          data: sortedData.map(entry => entry.data[type] || 0),
          backgroundColor: typeColors[type],
          stack: 'stack', // Stack the durations for each date
        }));
  
        const ctx = document.getElementById('chart').getContext('2d');
        this.chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: sortedData.map(entry => entry.label),
            datasets: datasets,
          },
          options: {
            scales: {
              x: { stacked: true },
              y: { stacked: true },
            },
          },
        });
      },
    };
  }
  
  function getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hour}:${minute}`;
  }
  