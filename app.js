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
    const response = await fetch(`https://api.inaturalist.org/v1/search?q=${q.trim()}&sources=places`);
    const data = await response.json();
    console.log(data);
    current.place_records = data.results;
    document.querySelector('.resultsContainer .places').innerHTML =data.results.map((r, i) => `
            <p class="place" onclick="setPlace(this, ${i})">${r.record.display_name}</p>
        `).join('');
});

async function getIdentification() {
    const response = await fetch(`https://api.inaturalist.org/v1/identifications?current=true&place_id=${current.place.record.uuid}`);
    const data = await response.json();
    console.log(data);
    current.identification_records = data.results;
    document.querySelector('.resultsContainer .identifications').innerHTML =data.results.map((r, i) => {
        let name = r.observation.identifications[0].taxon.preferred_common_name;
        if (!name) name = r.observation.identifications[0].taxon.name;
        return `<p class="identification" onclick="setIdentification(this, ${i})">${name}</p>`
    }).join('');
};

function setIdentification(el, identificationI) {
    const identification = current.identification_records[identificationI];
    Array.from(document.querySelectorAll('.resultsContainer .identifications .identification')).forEach(p => p.classList.remove('selected'));
    el.classList.add('selected');
    current.identification = identification;
    console.log(current.identification);
}