import { LightningElement, api } from 'lwc';
import { loadStyle } from 'lightning/platformResourceLoader';
import FORM_FACTOR from '@salesforce/client/formFactor';
import paginationStyleCSS from '@salesforce/resourceUrl/paginationStyleCSS';

export default class b2bFpPagination extends LightningElement {

    @api pageSize;
    totalrecordscount = 0;
    pageList = [];
    startforShift = 8;
    index = 0;
    @api
    clickedPage = 1;

    allowedshiftno = [];
    @api
    totalpages = 0;

    prevStartVal = 1;
    @api prevEndVal;
    loaded = false;
    desktopOrTablet = false;
    mobileDevice = false;

    @api
    reinitialize(totalRecords) {
        this.totalrecordscount = totalRecords;
        this.startforShift = 8;
        this.index = 0;
        this.clickedPage = 1;
        this.allowedshiftno = [];
        this.totalpages = 0;
        this.prevStartVal = 1;
        this.prevEndVal = this.pageSize;
        this.getTotalPages();
    }

    connectedCallback() {
        this.getTotalPages();
        if (!this.loaded) {
            Promise.all([loadStyle(this, paginationStyleCSS)])
                .then(() => {})
                .catch(error => {
                    console.log(error.body.message);
                });
            this.handleFormFactor();
            this.loaded = true;
        }
    }

    renderedCallback() {
        this.changeColorOnClick();
        this.checkDisabled();
        if (this.mobileDevice) {
            this.template.querySelectorAll('.mobilePageButton').forEach(e => {
                if (this.totalpages >= 6) {
                    e.classList.add('mobileFontSmall');
                } else {
                    e.classList.remove('mobileFontSmall');
                }
            });
            if (this.totalpages >= 6) {
                this.template.querySelector('.mobileNext').classList.add('mobile_Next');
                this.template.querySelector('.mobilePrev').classList.add('mobile_Prev');
            } else {
                this.template.querySelector('.mobileNext').classList.remove('mobile_Next');
                this.template.querySelector('.mobilePrev').classList.remove('mobile_Prev');
            }
        }
    }

    handleFormFactor() {
        if (FORM_FACTOR === 'Large') {
            this.desktopOrTablet = true;
        } else if (FORM_FACTOR === 'Medium') {
            this.desktopOrTablet = true;
        } else if (FORM_FACTOR === 'Small') {
            this.desktopOrTablet = true;
        }else {
            this.desktopOrTablet = true;
        }
    }

    getTotalPages() {
        if (this.totalrecordscount && this.pageSize) {
            this.totalpages = Math.ceil(Number(this.totalrecordscount) / Number(this.pageSize));
            let default_list = [];

            if (this.totalpages <= 10) {
                for (let i = 1; i <= this.totalpages; i++) {
                    default_list.push(i);
                }
            }
            let pgl_default = this.totalpages > 10 ? [1, 2, 3, 4, 5, 6, 7, 8, '...', this.totalpages] : default_list;

            this.pageList = pgl_default;
        }
    }

    changeColorOnClick() {
        this.template.querySelectorAll('lightning-button').forEach(e => {
            if (Number(e.label) === this.clickedPage) {
                e.classList.add('currentpage');
                e.blur();
            } else {
                e.classList.remove('currentpage');
            }
        });
    }

    @api
    get totalrecords() {
        return this.totalrecordscount;
    }

    set totalrecords(value) {
        this.totalrecordscount = value;
        this.connectedCallback();
    }

    get startrange() {
        let startVal = (this.clickedPage - 1) * this.pageSize + 1;
        let isANumber = isNaN(startVal);

        if (isANumber) {
            startVal = this.prevStartVal;
        } else this.prevStartVal = startVal;

        return startVal;
    }

    get endrange() {
        let endVal = this.pageSize * this.clickedPage;
        let isANumber = isNaN(endVal);

        if (isANumber) {
            endVal = this.prevEndVal;
        }
        if (!isANumber && this.pageSize * this.clickedPage >= this.totalrecordscount) {
            endVal = this.totalrecordscount;
            this.prevEndVal = endVal;
        } else if (!isANumber) {
            endVal = this.pageSize * this.clickedPage;
            this.prevEndVal = endVal;
        }

        return endVal;
    }

    get disableleftarrow() {
        return this.clickedPage === 1;
    }

    get disablerightarrow() {
        return this.clickedPage === this.totalpages;
    }

    get rightshift() {
        return Number(this.index) === 2;
    }

    get leftshift() {
        return Number(this.index) === 7 || Number(this.index) === 8;
    }

    get isStartNoClicked() {
        return this.clickedPage - 1 === 4 || this.clickedPage < 8;
    }

    get isLastNoClcked() {
        return this.totalpages - this.clickedPage >= 4 && this.totalpages - this.clickedPage < 8;
    }

    get isLastPageClicked() {
        let last8array = [];

        for (let i = this.totalpages - 6; i <= this.totalpages; i++) {
            last8array.push(i);
        }

        return last8array.includes(this.clickedPage);
    }

    getallowedshiftno() {
        if (this.allowedshiftno) {
            if (!this.allowedshiftno.includes(8)) {
                this.allowedshiftno.push(8);
            }
            if (!this.allowedshiftno.includes(this.totalpages)) {
                this.allowedshiftno.push(this.totalpages);
            }
        }
    }

    handlePrevious(event) {
        if (this.clickedPage > 1) {
            this.clickedPage = this.clickedPage - 1;
            this.checkDisabled();
            this.dispatchPaginationevent();
            this.getallowedshiftno();
            if (this.clickedPage !== '...' && this.totalpages > 10) this.displayePages(this.clickedPage);
        }
    }

    handleNext(event) {
        if (this.clickedPage < this.totalpages) {
            this.clickedPage = this.clickedPage + 1;
            this.checkDisabled();
            this.dispatchPaginationevent();
            this.getallowedshiftno();
            if (this.clickedPage !== '...' && this.totalpages > 10) this.displayePages(this.clickedPage);
        }
    }

    checkDisabled() {
        if (this.totalpages === 1) {
            this.addDisableColorPrev();
            this.addDisableColorNext();
        } else {
            if (this.clickedPage === 1) {
                this.addDisableColorPrev();
            } else {
                this.removeDisableColorPrev();
            }

            if (this.clickedPage === this.totalpages) {
                this.addDisableColorNext();
            } else {
                this.removeDisableColorNext();
            }
        }
    }

    addDisableColorPrev() {
        let buttonid = 'prev';
        let prev = this.template.querySelector(`[data-id="${buttonid}"]`);

        prev.classList.add('disabledColor');
        prev.blur();
    }

    removeDisableColorPrev() {
        let buttonid = 'prev';
        let prev = this.template.querySelector(`[data-id="${buttonid}"]`);

        prev.classList.remove('disabledColor');
        prev.blur();
    }

    addDisableColorNext() {
        let buttonid = 'next';
        let next = this.template.querySelector(`[data-id="${buttonid}"]`);

        next.classList.add('disabledColor');
        next.blur();
    }

    removeDisableColorNext() {
        let buttonid = 'next';
        let next = this.template.querySelector(`[data-id="${buttonid}"]`);

        next.classList.remove('disabledColor');
        next.blur();
    }

    handleClick(event) {
        this.index = event.target.dataset.index;
        this.clickedPage = Number(event.target.label);
        this.getallowedshiftno();
        this.checkDisabled();
        if (event.target.label !== '...') this.dispatchPaginationevent();
        if (event.target.label !== '...' && this.totalpages > 10) {
            this.displayePages(this.clickedPage);
        }
    }

    displayePages(clickedPage) {
        if (clickedPage === this.startforShift) {
            this.pageList[1] = '...';
        }

        if (
            this.allowedshiftno &&
            !this.isStartNoClicked &&
            !this.isLastPageClicked &&
            (this.allowedshiftno.includes(clickedPage) || this.isLastNoClcked)
        ) {
            this.pageList[2] = clickedPage - 3;
            this.pageList[3] = clickedPage - 2;
            this.pageList[4] = clickedPage - 1;
            this.pageList[5] = clickedPage;
            this.pageList[6] = clickedPage + 1;
            this.pageList[7] = clickedPage + 2;
            this.pageList[8] = clickedPage + 3;
            if (this.isLastNoClcked) {
                this.pageList[9] = this.pageList[9] !== '...' ? this.totalpages : '...';
                if (this.pageList[9] && this.pageList[9] === this.totalpages) {
                    this.pageList.pop();
                }
            }
            this.allowedshiftno = [];
            this.allowedshiftno.push(this.pageList[2], this.pageList[8]);
        }

        if ((!this.isLastNoClcked || this.rightshift) && !this.isLastPageClicked && !this.isStartNoClicked) {
            this.pageList[9] = '...';
            this.pageList[10] = this.totalpages;
        }

        if ((this.isStartNoClicked && this.allowedshiftno.includes(this.clickedPage)) || this.clickedPage === 1) {
            this.pageList =
                this.totalpages <= 8 ? [1, 2, 3, 4, 5, 6, 7, 8] : [1, 2, 3, 4, 5, 6, 7, 8, '...', this.totalpages];
        }

        if (this.isLastPageClicked && this.allowedshiftno.includes(this.clickedPage)) {
            this.pageList[1] = '...';
            this.pageList[2] = this.totalpages - 7;
            this.pageList[3] = this.totalpages - 6;
            this.pageList[4] = this.totalpages - 5;
            this.pageList[5] = this.totalpages - 4;
            this.pageList[6] = this.totalpages - 3;
            this.pageList[7] = this.totalpages - 2;
            this.pageList[8] = this.totalpages - 1;
            this.pageList[9] = this.totalpages;
            if (this.pageList[10]) {
                this.pageList.pop();
            }
            this.allowedshiftno = [];
            this.allowedshiftno.push(this.pageList[2]);
        }
        this.pageList = [...this.pageList];
    }

    @api
    dispatchPaginationevent() {
        this.dispatchEvent(
            new CustomEvent('pagination', {
                detail: this.clickedPage,
                bubbles: true,
                composed: true
            })
        );
    }
}
