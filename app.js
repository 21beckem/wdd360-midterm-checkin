const current = {
    place_records: [],
    place: null,
    identification_records: [],
    identification: null,
};
function setPlace(el, placeI) {
    const place = current.place_records[placeI];
    Array.from(document.querySelectorAll('.resultsContainer .places .place')).forEach(p => p.classList.remove('selected'));
    el.classList.add('selected');
    current.place = place;
    getIdentification();
}

document.getElementById('placeSearchBtn').addEventListener('click', async function(e) {
    e.preventDefault();
    const q = e.target.previousElementSibling.value;
    if (!q) return;
    if (q.trim() === '') return;
    document.querySelector('.resultsContainer .places').innerHTML = '<center><span>Searching...</span></center>';
    const response = await fetch(`https://api.inaturalist.org/v1/search?q=${q.trim()}&sources=places`);
    const data = await response.json();
    console.log(data);
    current.place_records = data.results;
    if (data.results.length === 0) {
        document.querySelector('.resultsContainer .places').innerHTML = '<center><span>No Results</span></center>';
    } else {
        document.querySelector('.resultsContainer .places').innerHTML = data.results.map((r, i) => `
                <p class="place" onclick="setPlace(this, ${i})">${r.record.display_name}</p>
            `).join('');
    }
});

async function getIdentification() {
    document.querySelector('.resultsContainer .identifications').innerHTML = '<center><span>Identifying...</span></center>';
    const response = await fetch(`https://api.inaturalist.org/v1/identifications?current=true&place_id=${current.place.record.uuid}`);
    const data = await response.json();
    console.log(data);
    if (data.results.length === 0) {
        document.querySelector('.resultsContainer .identifications').innerHTML = '<center><span>No Results</span></center>';
    } else {
        // filter out duplicates
        current.identification_records = data.results.reduce((acc, r) => {
            if (acc.some(i => i.observation.id === r.observation.id)) return acc;
            return [...acc, r];
        }, []);
        document.querySelector('.resultsContainer .identifications').innerHTML = current.identification_records.map((r, i) => {
            let name = r.observation.identifications[0].taxon.preferred_common_name;
            if (!name) name = r.observation.identifications[0].taxon.name;
            return `<p class="identification" onclick="setIdentification(this, ${i})">${name}</p>`
        }).join('');
    }
};

function setIdentification(el, identificationI) {
    const identification = current.identification_records[identificationI];
    Array.from(document.querySelectorAll('.resultsContainer .identifications .identification')).forEach(p => p.classList.remove('selected'));
    el.classList.add('selected');
    current.identification = getSimpleIdentification(identification);
    console.log(current.identification);

    // fill up the result
    document.querySelector('.resultsContainer .result img.default-photo').src = current.identification.default_photo.url;
    document.querySelector('.resultsContainer .result .attribution').innerText = current.identification.default_photo.attribution;
    document.querySelector('.resultsContainer .result h2 a').innerText = current.identification.common_name;
    document.querySelector('.resultsContainer .result h2 a').href = current.identification.url;
    document.querySelector('.resultsContainer .result h4').innerText = 'Scientific Name: ' + current.identification.scientific_name;
    document.querySelector('.resultsContainer .result p').innerText = current.identification.description;
    document.querySelector('.resultsContainer .result .photos').innerHTML = current.identification.photos.map(p => `<img src="${p.url}" title="${p.attribution}">`).join('');
}

function getSimpleIdentification(identification) {;
    return {
        common_name: identification.observation.identifications[0].taxon.preferred_common_name,
        scientific_name: identification.observation.identifications[0].taxon.name,
        url: identification.observation.uri,
        description: identification.observation.description,
        default_photo: {
            url: identification.observation.taxon.default_photo.medium_url,
            attribution: identification.observation.taxon.default_photo.attribution
        },
        photos: identification.observation.photos.map(p => {return{ attribution: p.attribution, url: p.url }})
    }

}