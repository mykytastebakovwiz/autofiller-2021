chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case "startFiling":
            fillForms(message.data.people, message.data.company, message.data.jobs).then(() => {
                sendResponse({ status: 'Filling complete' });
            }).catch((error) => {
                console.error('Error in fillForms:', error);
                sendResponse({ status: error.message });
            });
            return true; // Async response

        case "downloadFiles":
            downloadFiles(message.filename).then((res) => {
                sendResponse({ status: 'Download complete' });
            }).catch((error) => {
                console.error('Error in downloading Files:', error);
                sendResponse({ status: error.message });
            });
            return true;

        default:
            sendResponse({ status: 'Unknown action' });
    }
});

async function fillForms(people, company, jobs) {
    const taxpayerLink = Array.from(document.querySelectorAll('#menu-in .btn-group.menu-item-200 .dropdown-menu a')).find(a => a.getAttribute('onclick')?.includes("submitTopNavForm('200'"));
    if (!taxpayerLink) {
        console.error('Taxpayer Information link not found');
        throw new Error('Taxpayer Information link not found');
    }
    taxpayerLink.click();
    await new Promise(resolve => setTimeout(resolve, 2000));

    const lockMessage = Array.from(document.querySelectorAll('span.help-text')).find(span => span.textContent.includes("This screen is locked because you've chosen to mail your tax return"));
    if (lockMessage) {
        const unlockLink = Array.from(lockMessage.querySelectorAll('a')).find(a => a.textContent.trim() === 'unlock your return');
        if (!unlockLink) {
            console.error('Unlock your return link not found');
            throw new Error('Unlock your return link not found');
        }
        unlockLink.click();
        await new Promise(resolve => setTimeout(resolve, 2000));

        const yesLink = Array.from(document.querySelectorAll('div.button-section a')).find(a => a.textContent.trim() === 'Yes');
        if (!yesLink) {
            console.error('Yes confirmation link not found');
            throw new Error('Yes confirmation link not found');
        }
        yesLink.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    document.querySelector('input[name="tp_f_name_e"]').value = people[1] || '';
    document.querySelector('input[name="tp_l_name_e"]').value = people[0] || '';
    document.querySelector('input[name="tp_occ"]').value = jobs[Math.floor(Math.random() * jobs.length)] || '';
    document.querySelector('input[name="tp_ssn_e-SSN"]').value = people[9] || '';
    document.querySelector('input[name="address_e"]').value = people[4] || '';
    document.querySelector('input[name="apt_no"]').value = people[5].split(" ")[1] || '';
    document.querySelector('input[name="city"]').value = people[6] || '';
    document.querySelector('select[name="state"]').value = people[7].trim() || '';
    document.querySelector('input[name="zip"]').value = people[8] || '';

    await new Promise(resolve => setTimeout(resolve, 2000));

    const continueButton = Array.from(document.querySelectorAll('div.button-section a')).find(a => {
        const span = a.querySelector('span.fsPageId-200');
        return span && span.textContent.trim().replace(/\s+/g, ' ') === 'Save and Continue';
    });
    if (!continueButton) {
        console.error('Save and Continue button not found');
        throw new Error('Save and Continue button not found');
    }
    continueButton.click();
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check for specific error message
    const errorElement = Array.from(document.querySelectorAll('span.norm-text')).find(span => 
        span.textContent.trim() === 'Please correct the following error(s) before continuing:'
    );
    if (errorElement) {
        console.error('Specific error message found:', errorElement.textContent);
        throw new Error('There is some issue in document');
    }

    const wagesLink = Array.from(document.querySelectorAll('#menu-in .btn-group.menu-item-301400 .dropdown-menu a')).find(a => a.getAttribute('onclick')?.includes("submitTopNavForm('300'"));
    if (!wagesLink) {
        console.error('Wages (W-2) link not found');
        throw new Error('Wages (W-2) link not found');
    }
    wagesLink.click();
    await new Promise(resolve => setTimeout(resolve, 2000));

    const editLink = Array.from(document.querySelectorAll('div.record-card a')).find(a => {
        const span = a.querySelector('span');
        return span && span.textContent.trim() === 'Edit';
    });
    if (editLink) {
        editLink.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    document.querySelector('input[name="emp_id_e-EIN"]').value = company[0] || '';
    document.querySelector('input[name="emp_name"]').value = company[1] || '';
    document.querySelector('input[name="emp_address"]').value = company[2] || '';
    document.querySelector('input[name="emp_city"]').value = company[3] || '';
    document.querySelector('select[name="emp_state"]').value = company[4].trim() || '';
    document.querySelector('input[name="emp_zip"]').value = company[5] || '';
    document.querySelector('input[name="wages-CURRENCY"]').value = people[14] || '';
    document.querySelector('input[name="fed_tax-CURRENCY"]').value = people[15] || '';
    document.querySelector('input[name="ss_wages-CURRENCY"]').value = people[16] || '';
    document.querySelector('input[name="ss_tax-CURRENCY"]').value = people[17] || '';
    document.querySelector('input[name="mc_wages-CURRENCY"]').value = people[18] || '';
    document.querySelector('input[name="mc_tax-CURRENCY"]').value = people[19] || '';
    document.querySelector('select[name="state_name0"]').value = people[36].trim() || '';
    document.querySelector('input[name="state_emp_id0"]').value = company[6] || '';
    document.querySelector('input[name="state_wages0-CURRENCY"]').value = people[37] || '';
    document.querySelector('input[name="state_tax0-CURRENCY"]').value = people[38] || '';

    await new Promise(resolve => setTimeout(resolve, 2000));

    const continueButtonOnIncome = Array.from(document.querySelectorAll('div.button-section a')).find(a => {
        const span = a.querySelector('span.fsPageId-310');
        return span && span.textContent.trim().replace(/\s+/g, ' ') === 'Save and Continue';
    });
    if (!continueButtonOnIncome) {
        console.error('Save and Continue button not found');
        throw new Error('Save and Continue button not found');
    }
    continueButtonOnIncome.click();
    await new Promise(resolve => setTimeout(resolve, 2000));

    const continueButtonOnDubleCheck = Array.from(document.querySelectorAll('div.button-section a')).find(a => {
        const span = a.querySelector('span.fsPageId-318');
        return span && span.textContent.trim().replace(/\s+/g, ' ') === 'Continue';
    });
    if (!continueButtonOnDubleCheck) {
        console.error('Save and Continue button not found');
        throw new Error('Save and Continue button not found');
    }
    continueButtonOnDubleCheck.click();
    await new Promise(resolve => setTimeout(resolve, 2000));
}

async function downloadFiles(filename) {
    const titleDiv = Array.from(document.querySelectorAll('.right-box .title')).find(
        title => title.textContent.trim().startsWith('DC')
    );

    let titleText;
    
    if (!!titleDiv) titleText = titleDiv.textContent.trim();

    if (titleText && titleText.includes('DC')) {
        // Click "Review Tax Return" button
        const reviewTaxReturnLink = Array.from(document.querySelectorAll('.dropdown-menu a')).find(
            a => a.textContent.includes('Review Tax Return') && a.getAttribute('onclick')?.includes("submitTopNavForm('950'")
        );
        if (!reviewTaxReturnLink) {
            console.error('Review Tax Return link not found');
            throw new Error('Review Tax Return link not found');
        }
        reviewTaxReturnLink.click();
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Click "Continue" button
        const continueButton = Array.from(document.querySelectorAll('.button-section a')).find(
            a => {
                const span = a.querySelector('span.fsPageId-950');
                return span && span.textContent.trim() === 'Continue';
            }
        );
        if (!continueButton) {
            console.error('Continue button not found');
            throw new Error('Continue button not found');
        }
        continueButton.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    if (!titleText) {
        const filingMethodLink = Array.from(document.querySelectorAll('#menu-in .btn-group.menu-item-905 .dropdown-menu a')).find(a => a.textContent.includes('Filing Method'));
        if (!filingMethodLink) {
            console.error('Filing Method link not found');
            throw new Error('Filing Method link not found');
        }
        filingMethodLink.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const continueButtonOnFiliongMethodOne = Array.from(document.querySelectorAll('div.button-section a')).find(a => {
        const span = a.querySelector('span.fsPageId-951');
        return span && span.textContent.trim().replace(/\s+/g, ' ') === 'Save and Continue';
    });
    if (!continueButtonOnFiliongMethodOne) {
        console.error('Save and Continue button not found');
        throw new Error('Save and Continue button not found');
    }
    continueButtonOnFiliongMethodOne.click();
    await new Promise(resolve => setTimeout(resolve, 2000));

    const continueButtonOnFiliongMethodTwo = Array.from(document.querySelectorAll('div.button-section a')).find(a => {
        const span = a.querySelector('span.fsPageId-959');
        return span && span.textContent.trim().replace(/\s+/g, ' ') === 'Save and Continue';
    });
    if (!continueButtonOnFiliongMethodTwo) {
        console.error('Save and Continue button not found');
        throw new Error('Save and Continue button not found');
    }
    continueButtonOnFiliongMethodTwo.click();
    await new Promise(resolve => setTimeout(resolve, 2000));

    const checkbox = document.querySelector('input[name="is_file_return_check"]');
    if (!checkbox) {
        console.error('Checkbox not found');
        throw new Error('Checkbox not found');
    }
    checkbox.checked = true;
    if (checkbox.onclick) {
        checkbox.onclick.call(checkbox);
    }
    await new Promise(resolve => setTimeout(resolve, 2000));

    const FinishButtonOnFiliongMethod = Array.from(document.querySelectorAll('div.button-section a')).find(a => {
        const span = a.querySelector('span.fsPageId-980');
        return span && span.textContent.trim() === 'Finish Tax Return';
    });
    if (!FinishButtonOnFiliongMethod) {
        console.error('Finish Tax Return button not found');
        throw new Error('Finish Tax Return button not found');
    }
    FinishButtonOnFiliongMethod.click();
    await new Promise(resolve => setTimeout(resolve, 2000));

    const clickOnce = (element) => {
        if (element.dataset.clicked) {
            return false;
        }
        element.dataset.clicked = 'true';
        element.click();
        return true;
    };

    const downloadFederalPDFButton = Array.from(document.querySelectorAll('.button-row a')).find(a => {
        const span = a.querySelector('span');
        return span && span.textContent.trim() === 'Download' && a.getAttribute('onclick')?.includes("downloadPDF('FTFCS'");
    });
    if (!downloadFederalPDFButton) {
        console.error('Federal tax return download button not found');
        throw new Error('Federal tax return download button not found');
    }
    if (clickOnce(downloadFederalPDFButton)) {
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const downloadStatePDFButton = Array.from(document.querySelectorAll('.button-row a')).find(a => {
        const span = a.querySelector('span');
        return span && span.textContent.trim() === 'Download' && a.getAttribute('onclick')?.includes("downloadPDF('STFCS'");
    });
    if (!downloadStatePDFButton) {
        console.error('Indiana tax return download button not found');
        throw new Error('Indiana tax return download button not found');
    }
    if (clickOnce(downloadStatePDFButton)) {
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}