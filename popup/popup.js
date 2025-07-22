document.addEventListener('DOMContentLoaded', () => {
    const peopleFileInput = document.getElementById('peopleFile');
    const jobsFileInput = document.getElementById('jobsFile');
    const startFillingButton = document.getElementById('startFilling');
    const downloadFilesButton = document.getElementById('downloadFiles');
    const downloadDataFilesButton = document.getElementById('downloadDataFiles');
    const statusDiv = document.getElementById('status');
    const peopleStatus = document.createElement('span');
    const jobsStatus = document.createElement('span');
  
    peopleFileInput.parentNode.appendChild(peopleStatus);
    jobsFileInput.parentNode.appendChild(jobsStatus);
  
    function updateStatus(message) {
      statusDiv.textContent = message;
      chrome.storage.local.set({ statusMessage: message });
    }
  
    function setButtonState(button, isEnabled) {
      button.disabled = !isEnabled;
      button.classList.toggle('disabled', !isEnabled);
    }
  
    function updateStartDownloadButtonsState(isEnabled) {
      setButtonState(startFillingButton, isEnabled);
      setButtonState(downloadFilesButton, isEnabled);
      chrome.storage.local.set({
        startFillingEnabled: isEnabled,
        downloadFilesEnabled: isEnabled
      });
    }
  
    function updateDownloadDataButtonState(usedPeople) {
      const isEnabled = usedPeople && usedPeople.length > 0;
      setButtonState(downloadDataFilesButton, isEnabled);
      chrome.storage.local.set({ downloadDataFilesEnabled: isEnabled });
    }
  
    function updateFileStatus(type, filename) {
      const statusElement = { people: peopleStatus, jobs: jobsStatus }[type];
      statusElement.textContent = filename ? ` (${filename})` : '';
      statusElement.style.color = filename ? 'green' : 'red';
    }
  
    function readFile(file, callback) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (file.name.endsWith('.csv')) {
          const text = e.target.result;
          const rows = text.split('\n').map(row => row.split(','));
          callback(rows);
        } else if (file.name.endsWith('.xlsx')) {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          callback(json);
        }
      };
      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    }
  
    // Restore UI state from storage when popup opens
    chrome.runtime.sendMessage({ action: "getFileStates" }, (response) => {
      updateFileStatus('people', response.peopleFilename);
      updateFileStatus('jobs', response.jobsFilename);
      updateDownloadDataButtonState(response.usedPeople);
  
      chrome.storage.local.get(
        ['statusMessage', 'startFillingEnabled', 'downloadFilesEnabled', 'downloadDataFilesEnabled'],
        (stored) => {
          updateStatus(stored.statusMessage || '');
          setButtonState(startFillingButton, stored.startFillingEnabled ?? true);
          setButtonState(downloadFilesButton, stored.downloadFilesEnabled ?? true);
          setButtonState(downloadDataFilesButton, stored.downloadDataFilesEnabled ?? (response.usedPeople && response.usedPeople.length > 0));
        }
      );
    });
  
    peopleFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      readFile(file, (data) => {
        const filteredData = data.filter(item => item[0] !== "" && item[0] !== "Last Name");
        chrome.runtime.sendMessage({
          action: "uploadPeopleFile",
          data: filteredData,
          filename: file.name
        }, (response) => {
          updateStatus(response.status);
          updateFileStatus('people', file.name);
          updateDownloadDataButtonState([]);
          // Reset buttons to enabled after upload
          updateStartDownloadButtonsState(true);
        });
      });
    });

    jobsFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      readFile(file, (data) => {
        const filteredData = data.filter(item => item[0] !== "");
        chrome.runtime.sendMessage({
          action: "uploadJobsFile",
          data: filteredData,
          filename: file.name
        }, (response) => {
          updateStatus(response.status);
          updateFileStatus('jobs', file.name);
        });
      });
    });
  
    startFillingButton.addEventListener("click", () => {
      updateStatus("Please wait for a while...");
      updateStartDownloadButtonsState(false); // disable start and download buttons
  
      chrome.runtime.sendMessage({ action: "startFiling" }, (response) => {
        updateStatus(response.status);
        updateDownloadDataButtonState(response.usedPeople);
        updateStartDownloadButtonsState(true); // enable start and download buttons after done
      });
    });
  
    downloadFilesButton.addEventListener("click", () => {
      updateStatus("Please wait for a while...");
      updateStartDownloadButtonsState(false); // disable start and download buttons
  
      chrome.runtime.sendMessage({ action: "downloadFiles" }, (response) => {
        updateStatus(response.status);
        if (response.usedPeople) {
          updateDownloadDataButtonState(response.usedPeople);
        }
        chrome.runtime.sendMessage({ action: "getFileStates" }, (res) => {
          updateFileStatus('people', res.peopleFilename);
          updateDownloadDataButtonState(res.usedPeople);
        });
        updateStartDownloadButtonsState(true); // enable start and download buttons after done
      });
    });
  
    downloadDataFilesButton.addEventListener("click", () => {
      updateStatus("Please wait for a while...");
      chrome.runtime.sendMessage({ action: "downloadDataFiles" }, (response) => {
        updateStatus(response.status);
        updateDownloadDataButtonState(response.usedPeople);
  
        const downloadCSV = (filename, data) => {
          const csv = data.map(row => row.join(",")).join("\n");
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a); // append required for Firefox
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        };
  
        downloadCSV("remainpeople.csv", response.remainPeople || []);
        downloadCSV("usedpeople.csv", response.usedPeople || []);
      });
    });
  });
  