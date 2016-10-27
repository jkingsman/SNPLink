var input = document.querySelector('#snpUpload');

function loadFile(){
  log('Loading ' + input.files[0].name + '; please be patient (this may take a few minutes)');
  var reader = new FileReader();

  reader.onload = function(event) {
      log('Data processing beginning');
      var rawSNPs = event.target.result.replace(/^\#.*/gm, '').split('\n');

      // trim empty lines out
      while (rawSNPs[0].length < 2) {
          rawSNPs.shift();
      }

      var brokenSNPs = {},
        discardCount = 0;
      rawSNPs.forEach(function(snpLine) {
          if (snpLine.indexOf('rs') === 0) {
              snpLine = snpLine.split('\t');
              var snpEntry = {
                  'chromosome': snpLine[1],
                  'position': snpLine[2],
                  'allele': snpLine[3]
              };
              brokenSNPs[snpLine[0]] = snpEntry;
          } else {
            discardCount++;
          }
      });

      chrome.storage.local.set({'snps': brokenSNPs}, function() {
        log(Object.keys(brokenSNPs).length + ' alleles loaded (' + discardCount + ' internal references ignored)');
        log('Data processing complete; happy browsing!');
      });

  };

  reader.readAsText(input.files[0]);
}

input.addEventListener('change', function() {
  log('Clearing existing alleles, if any');
  chrome.storage.local.clear(function() {
      var error = chrome.runtime.lastError;
      if (error) {
          console.error(error);
      } else {
        loadFile();
      }
  });
});

function log(msg) {
    var list = document.querySelector('#status');
    var entry = document.createElement('li');
    entry.appendChild(document.createTextNode(msg));
    list.appendChild(entry);
}

document.querySelector('#clearAlleles').addEventListener('click', function(){
  log('Deleting all alleles; please wait');
  chrome.storage.local.clear(function() {
      var error = chrome.runtime.lastError;
      if (error) {
        log('Error: ' + error);
      } else {
        log('Alleles cleared');
      }
  });
});

input.disabled = true;
log('Determining status; please wait');
chrome.storage.local.get(null, function(items){
  if(items.hasOwnProperty('snps')){
    log(Object.keys(items.snps).length + ' alleles loaded');
  } else {
    log('No alleles loaded');
  }

  log('Ready for file input');
  input.disabled = false;
});
