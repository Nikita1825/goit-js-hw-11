// import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
const axios = require('axios').default;



const form = document.getElementById('search-form');
const input = document.querySelector('input [text]');
const btnEl = document.querySelector('button [submit]');
const gallery = document.querySelector('.gallery');
const btnLoadMore = document.querySelector('.load-more');


const BASE_URL = 'https://pixabay.com/api/';
const key = '36587464-4c7af3360402d576ec8eb9edd';

let value = "";
let currentPage = 1;
let perPage = 40;
let lightbox;
let isLastPage;

 function fetchPix(name, page) {
    const url = `
        ${BASE_URL}?key=${key}&q=${name}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}
    `;
  
     return axios
       .get(url)
       .then(response => {
         const { hits, totalHits } = response.data;
         const isLastPage = currentPage * perPage >= totalHits;
         return { images: hits, totalHits };
       })
       .catch(error => {
         throw new Error(`Failed to fetch images: ${error.message}`);
       });
}







form.addEventListener('submit', onSearch);
btnLoadMore.addEventListener('click', onLoadMore);


async function onSearch(e) {
    e.preventDefault();
  clearGallery();
  
    
  const searchQuery = e.currentTarget.elements.searchQuery.value.trim();
  if (searchQuery === '') {
      
      return;
  };
  
    value = searchQuery;
    currentPage = 1;
    try {
      const { images } = await fetchPix(value, currentPage);
      if (images.length === 0) {
        showNoResultsMessage();
        return;
      }
     

      mapImages(images);
      initializeLightbox();
      //  btnLoadMore.show();
      hideLoadMoreButton();
    } 
    catch (error) {
    console.error(error);
  }
}
    

function mapImages(images) {
    const cards = images
      .map(image => createImageCard(image))
        .join('');
    gallery.insertAdjacentHTML('beforeend', cards);
}

function createImageCard(image) {
    return `
    <div class="photo-card">
      <a class="photo-card-link" href="${image.largeImageURL}">
        <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" /> 
        <div class="info">
          <p class="info-item">
            <b>Likes:</b> ${image.likes}
          </p>
          <p class="info-item">
            <b>Views:</b> ${image.views}
          </p>
          <p class="info-item">
            <b>Comments:</b> ${image.comments}
          </p>
          <p class="info-item">
            <b>Downloads:</b> ${image.downloads}
          </p>
        </div>
      </a>
    </div>
  `;
}

async function onLoadMore() {
    currentPage += 1;
    try {
        const { images } = await fetchPix(value, currentPage);
        if (images.length === 0) {
            showLoadMoreButton();
          showEndOfResultsMessage();
          btnLoadMore.hide();
            return;
        };
         if (lightbox) {
           lightbox.refresh();
      };
      mapImages(images);
       if (isLastPage) {
         Notiflix.Notify.info(
           "We're sorry, but you've reached the end of search results."
         );
         btnLoadMore.hide();
       }
      
      //  const { images: nextImages } = await fetchPix(
         
      //    currentPage + 1
      //  );

      //  if (nextImages.length === 0) {
      //   btnLoadMore.hide()
      //  }

    }
    catch (error) {
        console.error(error);
    }
}




function clearGallery() {
  gallery.innerHTML = ''
}
function showNoResultsMessage() {
  Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  )
};
function showEndOfResultsMessage() {
  Notiflix.Notify.info(
    "We're sorry, but you've reached the end of search results."
  );
}

function initializeLightbox() {
  lightbox = new SimpleLightbox('.photo-card .photo-card-link', {
    captions: true,
    captionsData: 'alt',
    captionPosition: 'bottom',
    captionDelay: 250,
  });
}
function showLoadMoreButton() {
  btnLoadMore.classList.remove('is-hidden');
}

function hideLoadMoreButton() {
  btnLoadMore.classList.add('is-hidden');
}
