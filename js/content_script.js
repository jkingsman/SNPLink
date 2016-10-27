var rsRegex = /rs\d+/;
var snps = [];


function checkMatch(textNode) {
    var v = textNode.nodeValue;
    if (v.length > 3) {
        var matches = v.match(rsRegex);
        if (matches) {
            snps.push(matches[0]);
        }
    }
}

function walk(node) {
    // I stole this function from here:
    // http://is.gd/mwZp7E
    var child, next;

    switch (node.nodeType) {
        case 1:
            // Element
        case 9:
            // Document
        case 11:
            // Document fragment
            child = node.firstChild;
            while (child) {
                next = child.nextSibling;
                walk(child);
                child = next;
            }
            break;

        case 3:
            // Text node
            handleText(node);
            break;
    }
}

function drawSNPs(personalSNPList) {
    // pull out if we didn't recover any
    if (snps.length === 0) {
        return;
    }

    // remove duplicates
    snps = snps.filter(function(el, i, arr) {
        return arr.indexOf(el) === i;
    });

    // sort in numerical order
    snps = snps.sort();

    var snpContainer = document.createElement('div');
    snpContainer.id = 'snpContainer';

    snpContainer.style.position = 'fixed';
    snpContainer.style.bottom = '10px';
    snpContainer.style.left = '10px';
    snpContainer.style.paddingRight = '10px';
    snpContainer.style.backgroundColor = 'rgba(128, 128, 128, 0.5)';
    snpContainer.style.zIndex = 1000;
    snpContainer.onclick = function(){
      this.style.display = 'none';
    };

    var title = document.createElement('h4');
    title.innerHTML = 'SNPLink';
    title.style.marginLeft = '10px';
    snpContainer.appendChild(title);

    var hr = document.createElement('hr');
    hr.style.marginTop = '0px';
    snpContainer.appendChild(hr);

    var snpList = document.createElement('ul');
    var matchedSNPs = 0;
    snps.forEach(function(snp) {
        if (personalSNPList.hasOwnProperty(snp)) {
            var snpEntry = document.createElement('li');
            var allele = personalSNPList[snp].allele;
            snpEntry.innerHTML = snp + ': ' + allele;
            snpList.appendChild(snpEntry);
            matchedSNPs++;
        }
    });

    snpContainer.appendChild(snpList);

    if (matchedSNPs > 0) {
        document.body.appendChild(snpContainer);
    }
}

chrome.storage.local.get(null, function(items) {
    if (items.hasOwnProperty('snps')) {
        var textNodes = textNodesUnder(document.body);
        textNodes.forEach(function(match) {
            checkMatch(match);
        });
        drawSNPs(items.snps);
    }


});

function textNodesUnder(el) {
    var n, a = [],
        walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    while (n = walk.nextNode()) {
        a.push(n);
    }
    return a;
}
