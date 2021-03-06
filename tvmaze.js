"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

//TV_MAZE_BASE_URL
const BASE_URL = "http://api.tvmaze.com/";
const NOT_FOUND_URL = "https://tinyurl.com/tv-missing";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object contains exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  let shows = []; //TODO: USE A MAP!!!!!!!!!
  let showData = await axios.get(`${BASE_URL}search/shows`, { params: { q: term } });
  //TODO: rename show so it's not repeated later on on line25 etc
  for (let show of showData.data) {

    let showInfo = {
      id: show.show.id,
      name: show.show.name,
      summary: show.show.summary,
      image: show.show.image ? show.show.image.original : NOT_FOUND_URL
    };

    shows.push(showInfo);
  }
  console.log(shows);
  return shows;
}


/** Given list of shows, create markup for each and add to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}" 
              alt="Image of ${show.name}" 
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
//TODO: Const rather than let
async function getEpisodesOfShow(id) {
  let episodeData = await axios.get(`${BASE_URL}shows/${id}/episodes`);
  let episodes = episodeData.data.map(makeEpisodeObj);
  console.log(episodes);

  return episodes;
}

//TODO: Move this function into  getEpisodesOfShow
/** Takes data from TVMaze API, returns an episode object */
function makeEpisodeObj(data) {
  let episodeInfo = {
    id: data.id,
    name: data.name,
    season: data.season,
    number: data.number,
  };
  return episodeInfo;
}

/** Takes an array of episode objects*/
function populateEpisodes(episodes) {
  $episodesArea.show();
  for (let episode of episodes) {
    const $episode = $(`<li>${episode.name}
      (Season ${episode.season}, number ${episode.number})</li>`);
    console.log($episode);
    $("#episodesList").append($episode);
  }

}

/** Controller for episodes 
 * Called when Episode button is clicked
 * Gets show ID from the data attribute of div with "Show class"
 * passes showId to populate episodes
*/ 
//CONST
async function getEpisodesAndDisplay(evt) {
  let elementClicked = $(evt.target);
  console.log(`You clicked the ${elementClicked.closest("div.Show").attr("data-show-id")}!`);

  const showID = elementClicked.closest("div.Show").attr("data-show-id");

  let episodes = await getEpisodesOfShow(showID);
  populateEpisodes(episodes);

}

/**Event listener in #showsList for Show-getEpisodes button */
$("#showsList").on("click", ".Show-getEpisodes", async function (evt) {
  evt.preventDefault();
  await getEpisodesAndDisplay(evt);
})


