chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case "startFiling":
            fillForms(message.data.people, message.data.jobs, message.data.services).then(() => {
                sendResponse({ status: 'Filling complete' });
            }).catch((error) => {
                console.error('Error in fillForms:', error);
                sendResponse({ status: error.message });
            });
            return true;

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

async function fillForms(people, jobs, services) {
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

    const businessIncomeLink = Array.from(document.querySelectorAll('#menu-in .btn-group.menu-item-301400 .dropdown-menu a')).find(a => a.getAttribute('onclick')?.includes("submitTopNavForm('200000'"));
    if (!businessIncomeLink) {
        console.error('Business Income link not found');
        throw new Error('Business Income link not found');
    }
    businessIncomeLink.click();
    await new Promise(resolve => setTimeout(resolve, 2000));

    const confirmButton = Array.from(document.querySelectorAll('div.button-section a')).find(a => {
        const span = a.querySelector('span.fsPageId-200000');
        return span && span.textContent.trim() === 'Yes';
    });
    if (confirmButton) {
        confirmButton.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const editLink = Array.from(document.querySelectorAll('div.edit-delete a')).find(a => {
        const span = a.querySelector('span');
        return span && span.textContent.trim() === 'Edit';
    });
    if (editLink) {
        editLink.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const sections = Array.from(document.querySelectorAll('.section'));

    const overviewSection = sections.find(section => {
        const titleSpan = section.querySelector('.summary-title .summary-table-title');
        return titleSpan && titleSpan.textContent.trim() === 'Overview';
    });

    if (overviewSection) {
        const overviewEditLink = overviewSection.querySelector('.summary-collapse a.btn.btn-sm.btn-primary span');
        if (overviewEditLink && overviewEditLink.textContent.trim() === 'Edit') {
            overviewEditLink.closest('a').click();
            await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
            console.error('Edit button not found in Overview section');
        }
    } else {
        console.error('Overview section not found');
    }

    const min = services[1][0];
    const max = services[1][1];

    const servicesList = Array.isArray(services?.[1]) ? services[1].slice(2, services[1].length) : [];
    const randomService = servicesList.length > 0 ? servicesList[Math.floor(Math.random() * servicesList.length)] : null;
    document.querySelector('input[name="bus_desc"]').value = randomService;

    await new Promise(resolve => setTimeout(resolve, 2000));

    const continueButtonOnIncome = Array.from(document.querySelectorAll('div.button-section a')).find(a => {
        const span = a.querySelector('span.fsPageId-200005');
        return span && span.textContent.trim().replace(/\s+/g, ' ') === 'Save and Continue';
    });
    if (!continueButtonOnIncome) {
        console.error('Save and Continue button not found');
        throw new Error('Save and Continue button not found');
    }
    continueButtonOnIncome.click();
    await new Promise(resolve => setTimeout(resolve, 2000));

    const busCatSelect = document.getElementById('bus_category');
    const busCatOptions = Array.from(busCatSelect.options).slice(1); // exclude the first option
    const busCatOptionsRandomOption = busCatOptions.length ? busCatOptions[Math.floor(Math.random() * busCatOptions.length)] : null;
    if (busCatOptionsRandomOption?.value) busCatSelect.value = busCatOptionsRandomOption.value;

    const busCodeSelect = document.getElementById('bus_code');
    const busCodeOptions = Array.from(busCodeSelect.options).slice(1); // exclude the first option
    console.log("busCodeOptions => ", busCodeOptions);
    const busCodeOptionsRandomOption = busCodeOptions.length ? busCodeOptions[Math.floor(Math.random() * busCodeOptions.length)] : null;
    console.log("buscodeoptionrandom => ", busCodeOptionsRandomOption);
    if (busCodeOptionsRandomOption?.value) busCodeSelect.value = busCodeOptionsRandomOption.value;

    await new Promise(resolve => setTimeout(resolve, 2000));

    const continueButtonOnDubleCheck = Array.from(document.querySelectorAll('div.button-section a')).find(a => {
        const span = a.querySelector('span.fsPageId-200006');
        return span && span.textContent.trim().replace(/\s+/g, ' ') === 'Save and Continue';
    });
    if (!continueButtonOnDubleCheck) {
        console.error('Save and Continue button not found');
        throw new Error('Save and Continue button not found');
    }
    continueButtonOnDubleCheck.click();
    await new Promise(resolve => setTimeout(resolve, 2000));

    const errormessageCheck = document.querySelector('div.audit-message.error-message');

    if (errormessageCheck) {
        const busCodeSelect = document.getElementById('bus_code');

        if (busCodeSelect) {
            const busCodeOptions = Array.from(busCodeSelect.options).filter(opt => opt.value); // exclude empty option
            const randomOption = busCodeOptions[Math.floor(Math.random() * busCodeOptions.length)];

            if (randomOption?.value) {
                busCodeSelect.value = randomOption.value;

                // Optionally dispatch a change event if necessary
                const event = new Event('change', { bubbles: true });
                busCodeSelect.dispatchEvent(event);

                // Optional delay
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        const continueButtonOnDubleCheckOnError = Array.from(document.querySelectorAll('div.button-section a')).find(a => {
            const span = a.querySelector('span.fsPageId-200006');
            return span && span.textContent.trim().replace(/\s+/g, ' ') === 'Save and Continue';
        });
        if (!continueButtonOnDubleCheckOnError) {
            console.error('Save and Continue button not found');
            throw new Error('Save and Continue button not found');
        }
        continueButtonOnDubleCheckOnError.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const sectionTitles = Array.from(document.querySelectorAll('.summary-title-section'));

    const incomeSectionIndex = sectionTitles.findIndex(section => {
        const titleSpan = section.querySelector('.summary-table-title');
        return titleSpan && titleSpan.textContent.trim() === 'Income';
    });

    if (incomeSectionIndex !== -1) {
        const collapses = document.querySelectorAll('.summary-collapse');
        const incomeCollapse = collapses[incomeSectionIndex];
        
        const incomeEditLink = incomeCollapse.querySelector('a.btn.btn-sm.btn-primary span');
        if (incomeEditLink && incomeEditLink.textContent.trim() === 'Edit') {
            incomeEditLink.closest('a').click();
            await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
            console.error('Edit button not found in Income section');
        }
    } else {
        console.error('Income section not found');
    }

    document.getElementById('is_1099_misc_received-2').checked = true;
    await new Promise(resolve => setTimeout(resolve, 2000));

    const continueButtonOnSecondEdit = Array.from(document.querySelectorAll('div.button-section a')).find(a => {
        const span = a.querySelector('span.fsPageId-200037');
        return span && span.textContent.trim().replace(/\s+/g, ' ') === 'Save and Continue';
    });
    if (!continueButtonOnSecondEdit) {
        console.error('Save and Continue button not found');
        throw new Error('Save and Continue button not found');
    }
    continueButtonOnSecondEdit.click();
    await new Promise(resolve => setTimeout(resolve, 2000));

    document.querySelector('input[name="other_receipts_non_1099k-CURRENCY"]').value = Math.floor(Math.random() * (max - min + 1)) + 1500;
    await new Promise(resolve => setTimeout(resolve, 2000));

    const continueButtonOnSecondEditDouble = Array.from(document.querySelectorAll('div.button-section a')).find(a => {
        const span = a.querySelector('span.fsPageId-200040');
        return span && span.textContent.trim().replace(/\s+/g, ' ') === 'Save and Continue';
    });
    if (!continueButtonOnSecondEditDouble) {
        console.error('Save and Continue button not found');
        throw new Error('Save and Continue button not found');
    }
    continueButtonOnSecondEditDouble.click();
    await new Promise(resolve => setTimeout(resolve, 2000));

    const continueButtonOnSecondEditDoubleOptional = Array.from(document.querySelectorAll('div.button-section a')).find(a => {
        const span = a.querySelector('span.fsPageId-200140');
        return span && span.textContent.trim().replace(/\s+/g, ' ') === 'Save and Continue';
    });
    if (continueButtonOnSecondEditDoubleOptional) {
        continueButtonOnSecondEditDoubleOptional.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const continueButtonOnSecondEditFinal = Array.from(document.querySelectorAll('div.button-section a')).find(a => {
        const span = a.querySelector('span.fsPageId-200004');
        return span && span.textContent.trim().replace(/\s+/g, ' ') === 'Continue';
    });
    if (!continueButtonOnSecondEditFinal) {
        console.error('Continue button not found');
        throw new Error('Continue button not found');
    }
    continueButtonOnSecondEditFinal.click();
    await new Promise(resolve => setTimeout(resolve, 2000));

    const continueButtonFinal1 = Array.from(document.querySelectorAll('div.button-section a')).find(a => {
        const span = a.querySelector('span.fsPageId-202272');
        return span && span.textContent.trim().replace(/\s+/g, ' ') === 'Save and Continue';
    });
    if (continueButtonFinal1) {
        continueButtonFinal1.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const continueButtonFinal2 = Array.from(document.querySelectorAll('div.button-section a')).find(a => {
        const span = a.querySelector('span.fsPageId-202271');
        return span && span.textContent.trim().replace(/\s+/g, ' ') === 'Save and Continue';
    });
    if (continueButtonFinal2) {
        continueButtonFinal2.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

async function downloadFiles(filename) {
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