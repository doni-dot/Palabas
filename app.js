const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const results = document.getElementById('results');
const statusEl = document.getElementById('status');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.getElementById('close-btn');

console.log("APP LOADED");

async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("HTTP " + r.status);
  return await r.json();
}

const SAMPLE_SHOWS = [
  { show: { id: 1, name: "Breaking Bad", premiered: "2008-01-20", rating: { average: 9.2 }, image: { medium: "https://static.tvmaze.com/uploads/images/medium_portrait/31/78286.jpg" }, summary: "<p>A chemistry teacher turns to making meth.</p>", genres: ["Drama"] } },
  { show: { id: 2, name: "Friends", premiered: "1994-09-22", rating: { average: 8.9 }, image: { medium: "https://static.tvmaze.com/uploads/images/medium_portrait/41/104550.jpg" }, summary: "<p>Six friends in New York.</p>", genres: ["Comedy"] } },
  { show: { id: 3, name: "Stranger Things", premiered: "2016-07-15", rating: { average: 8.7 }, image: { medium: "https://static.tvmaze.com/uploads/images/medium_portrait/244/610531.jpg" }, summary: "<p>Kids uncover mysteries in Hawkins.</p>", genres: ["Drama"] } }
];

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = input.value.trim();
  if (!query) return;
  const mode = document.querySelector('input[name="mode"]:checked').value;
  results.innerHTML = '';
  statusEl.textContent = 'Loading...';
  try {
    let data;
    if (mode === 'sample') {
      data = SAMPLE_SHOWS.filter(item => item.show.name.toLowerCase().includes(query.toLowerCase()));
      if (data.length === 0) data = SAMPLE_SHOWS;
    } else {
      data = await getJSON('https://api.tvmaze.com/search/shows?q=' + encodeURIComponent(query));
    }
    if (data.length === 0) { statusEl.textContent = 'No shows found.'; return; }
    statusEl.textContent = 'Found ' + data.length + ' show(s) for "' + query + '"';
    data.forEach(item => {
      const show = item.show;
      const card = document.createElement('div');
      card.className = 'card';
      const img = show.image ? show.image.medium : 'https://via.placeholder.com/210x295?text=No+Image';
      const rating = show.rating && show.rating.average ? show.rating.average : 'N/A';
      const year = show.premiered ? show.premiered.slice(0,4) : 'N/A';
      card.innerHTML = '<img src="' + img + '"><h3>' + show.name + '</h3><p>⭐ ' + rating + ' | ' + year + '</p>';
      card.addEventListener('click', () => showDetails(show.id, mode));
      results.appendChild(card);
    });
  } catch (err) {
    statusEl.textContent = 'Error: Could not load shows. Try Sample Mode.';
    console.error(err);
  }
});

async function showDetails(id, mode) {
  modal.classList.remove('hidden');
  modalBody.innerHTML = '<p>Loading details...</p>';
  try {
    let show, cast, seasons;
    if (mode === 'sample') {
      show = SAMPLE_SHOWS.find(s => s.show.id === id).show;
      cast = [{ person: { name: "Sample Actor 1" }, character: { name: "Main Character" } }];
      seasons = [{ number: 1 }, { number: 2 }];
    } else {
      const res = await Promise.all([
        getJSON('https://api.tvmaze.com/shows/' + id),
        getJSON('https://api.tvmaze.com/shows/' + id + '/cast'),
        getJSON('https://api.tvmaze.com/shows/' + id + '/seasons')
      ]);
      show = res[0]; cast = res[1]; seasons = res[2];
    }
    const castList = cast.slice(0,5).map(c => c.person.name + ' as ' + c.character.name).join('<br>');
    const img = show.image ? (show.image.original || show.image.medium) : '';
    modalBody.innerHTML = '<img src="' + img + '"><h2>' + show.name + '</h2><p>Rating: ' + (show.rating && show.rating.average ? show.rating.average : 'N/A') + ' | Seasons: ' + seasons.length + '</p><div>' + (show.summary || 'No summary') + '</div><h3>Top Cast</h3><p>' + castList + '</p>';
  } catch (err) {
    modalBody.innerHTML = '<p>Error loading details.</p>';
    console.error(err);
  }
}

closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });