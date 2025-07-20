let peopleData = [];
let companyData = [];
let jobsData = [];
let usedPeople = [];
let peopleFilename = '';
let companyFilename = '';
let jobsFilename = '';

// Button & status states stored to keep UI consistent across popup toggles
let startFillingEnabled = true;
let downloadFilesEnabled = true;
let downloadDataFilesEnabled = false;
let statusMessage = '';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "uploadPeopleFile":
      peopleData = message.data;
      peopleFilename = message.filename || '';
      usedPeople = []; // reset usedPeople when new people file is uploaded
      // reset buttons: enable startFilling and downloadFiles, disable downloadDataFiles because usedPeople is empty
      startFillingEnabled = true;
      downloadFilesEnabled = true;
      downloadDataFilesEnabled = false;
      statusMessage = 'People file loaded';

      chrome.storage.local.set({
        peopleData,
        peopleFilename,
        usedPeople,
        startFillingEnabled,
        downloadFilesEnabled,
        downloadDataFilesEnabled,
        statusMessage
      }, () => {
        sendResponse({ status: statusMessage });
      });
      return true;

    case "uploadCompanyFile":
      companyData = message.data;
      companyFilename = message.filename || '';
      statusMessage = 'Company file loaded';

      chrome.storage.local.set({
        companyData,
        companyFilename,
        statusMessage
      }, () => {
        sendResponse({ status: statusMessage });
      });
      return true;

    case "uploadJobsFile":
      jobsData = message.data;
      jobsFilename = message.filename || '';
      statusMessage = 'Jobs file loaded';

      chrome.storage.local.set({
        jobsData,
        jobsFilename,
        statusMessage
      }, () => {
        sendResponse({ status: statusMessage });
      });
      return true;

    case "getFileStates":
      chrome.storage.local.get([
        'peopleData', 'companyData', 'jobsData', 'usedPeople',
        'peopleFilename', 'companyFilename', 'jobsFilename',
        'startFillingEnabled', 'downloadFilesEnabled', 'downloadDataFilesEnabled',
        'statusMessage'
      ], (result) => {
        peopleData = result.peopleData || [];
        companyData = result.companyData || [];
        jobsData = result.jobsData || [];
        usedPeople = result.usedPeople || [];
        peopleFilename = result.peopleFilename || '';
        companyFilename = result.companyFilename || '';
        jobsFilename = result.jobsFilename || '';
        startFillingEnabled = typeof result.startFillingEnabled === 'boolean' ? result.startFillingEnabled : true;
        downloadFilesEnabled = typeof result.downloadFilesEnabled === 'boolean' ? result.downloadFilesEnabled : true;
        downloadDataFilesEnabled = typeof result.downloadDataFilesEnabled === 'boolean' ? result.downloadDataFilesEnabled : (usedPeople.length > 0);
        statusMessage = result.statusMessage || '';

        sendResponse({
          peopleFilename,
          companyFilename,
          jobsFilename,
          usedPeople,
          startFillingEnabled,
          downloadFilesEnabled,
          downloadDataFilesEnabled,
          status: statusMessage || 'Files already loaded'
        });
      });
      return true;

    case "startFiling":
      if (peopleData.length === 0 || companyData.length === 0 || jobsData.length === 0) {
        sendResponse({ status: 'Please upload all required files' });
        return;
      }

      // Disable buttons while filling
      startFillingEnabled = false;
      downloadFilesEnabled = false;
      statusMessage = 'Filling started...';

      chrome.storage.local.set({
        startFillingEnabled,
        downloadFilesEnabled,
        statusMessage
      });

      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (!tab?.id) {
          sendResponse({ status: 'No active tab' });
          return;
        }
        chrome.tabs.sendMessage(tab.id, {
          action: "startFiling",
          data: {
            people: peopleData[0],
            company: companyData[0],
            jobs: jobsData
          }
        }, (response) => {
          // Enable buttons again after done
          startFillingEnabled = true;
          downloadFilesEnabled = true;
          statusMessage = response.status || 'Filling done';

          chrome.storage.local.set({
            startFillingEnabled,
            downloadFilesEnabled,
            statusMessage
          });

          sendResponse(response);
        });
      });
      return true;

    case "downloadFiles":
      if (peopleData.length === 0) {
        sendResponse({ status: 'Please upload a people file' });
        return;
      }

      // Disable buttons while downloading files
      startFillingEnabled = false;
      downloadFilesEnabled = false;
      statusMessage = 'Downloading files...';

      chrome.storage.local.set({
        startFillingEnabled,
        downloadFilesEnabled,
        statusMessage
      });

      const person = peopleData[0];
      const filename = `${person[0]}${person[1]}${person[9]}${person[36]}.pdf`;
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (!tab?.id) {
          sendResponse({ status: 'No active tab' });
          return;
        }
        chrome.tabs.sendMessage(tab.id, {
          action: "downloadFiles",
          filename
        }, (response) => {
          if (response.status === "Download complete") {
            chrome.storage.local.get(['usedPeople'], (result) => {
              const updatedUsedPeople = result.usedPeople || [];
              updatedUsedPeople.push(person);
              peopleData.shift();
              const peopleFilenameUpdate = peopleData.length > 0 ? peopleFilename : '';

              // Update usedPeople, peopleData and button states
              usedPeople = updatedUsedPeople;
              peopleFilename = peopleFilenameUpdate;

              // Enable buttons again
              startFillingEnabled = true;
              downloadFilesEnabled = true;
              downloadDataFilesEnabled = usedPeople.length > 0;
              statusMessage = 'Download complete, person data updated';

              chrome.storage.local.set({
                usedPeople,
                peopleData,
                peopleFilename,
                startFillingEnabled,
                downloadFilesEnabled,
                downloadDataFilesEnabled,
                statusMessage
              }, () => {
                sendResponse({ status: statusMessage, usedPeople });
              });
            });
          } else {
            // On failure enable buttons
            startFillingEnabled = true;
            downloadFilesEnabled = true;
            statusMessage = response.status || 'Download failed';

            chrome.storage.local.set({
              startFillingEnabled,
              downloadFilesEnabled,
              statusMessage
            });
            sendResponse(response);
          }
        });
      });
      return true;

    case "downloadDataFiles":
      chrome.storage.local.get(['peopleData', 'usedPeople'], (result) => {
        const remainPeople = result.peopleData || [];
        const usedPeople = result.usedPeople || [];

        // downloadDataFiles button state depends on usedPeople length
        downloadDataFilesEnabled = usedPeople.length > 0;
        statusMessage = 'CSV data ready';

        chrome.storage.local.set({
          downloadDataFilesEnabled,
          statusMessage
        });

        sendResponse({ status: statusMessage, remainPeople, usedPeople });
      });
      return true;

    default:
      sendResponse({ status: 'Unknown action' });
  }
});

chrome.storage.local.get([
  'peopleData', 'companyData', 'jobsData', 'usedPeople',
  'peopleFilename', 'companyFilename', 'jobsFilename',
  'startFillingEnabled', 'downloadFilesEnabled', 'downloadDataFilesEnabled',
  'statusMessage'
], (result) => {
  peopleData = result.peopleData || [];
  companyData = result.companyData || [];
  jobsData = result.jobsData || [];
  usedPeople = result.usedPeople || [];
  peopleFilename = result.peopleFilename || '';
  companyFilename = result.companyFilename || '';
  jobsFilename = result.jobsFilename || '';
  startFillingEnabled = typeof result.startFillingEnabled === 'boolean' ? result.startFillingEnabled : true;
  downloadFilesEnabled = typeof result.downloadFilesEnabled === 'boolean' ? result.downloadFilesEnabled : true;
  downloadDataFilesEnabled = typeof result.downloadDataFilesEnabled === 'boolean' ? result.downloadDataFilesEnabled : (usedPeople.length > 0);
  statusMessage = result.statusMessage || '';
});
