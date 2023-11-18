import React from 'react';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

const Pagination = ({ items, pageSize, onPageChange }) => {
  console.log("In Pagination comp, items is type:", typeof(items));
  console.log("In Pagination comp, items is an array?:", Array.isArray(items));
  console.log("In Pagination comp, items length:", items.length);
  console.log("In Pagination comp, items contents:", items);
  if (items.length <= 1) return null;

  let num = Math.ceil(items.length / pageSize);
  let pages = range(1, num + 1);
  const list = pages.map((page) => {
    return (
      <Button key={page} onClick={onPageChange} className="page-item">
        {page}
      </Button>
    );
  });
  return (
    <nav>
      <ul className="pagination">{list}</ul>
    </nav>
  );
};

const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};

function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
}

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });

  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const getMonthYear = () => {
  // Returns a date string to pass in the URL, eg: 11-2023
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const monthYear = `${currentMonth - 3}-${currentYear}`; // 3 months ago
  console.log("getMontYear returns:", monthYear)
  return monthYear;
}

// App that gets data from Hacker News url
function App() {
  const { Fragment, useState } = React;
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const monthYear = getMonthYear();
  const url = `https://api.punkapi.com/v2/beers?brewed_before=${monthYear}&abv_lt=6&per_page=30`;
  const [{ data, isLoading, isError }] = useDataApi(
    url,
    {
      hits: [],
    }
  );
  const handlePageChange = (e) => {
    setCurrentPage(Number(e.target.textContent));
  };

  let page = data.hits;
  console.log("In App, data.hits type is:", typeof(data.hits));
  console.log("In App, data.hits length is:", data.hits.length);
  console.log("In App, data.hits contents is:", data.hits);
  console.log("In App, data.hits is an array?:", Array.isArray(data.hits));
  console.log("In App, we reassinged data.hits to page");
  if (page.length >= 1) {  // only paginate if there are items _at all_
    page = paginate(page, currentPage, pageSize);
    console.log(`In App, currentPage is: ${currentPage}`);
    console.log("In App, we decided to paginate, now page is:", page);
  }

  return (
    <Fragment>
      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <ul className="list-group">
          {page.map((item) => (
            <li key={item.objectID} className="list-group-item">
              <a href={item.url}>{item.title}</a>
            </li>
          ))}
        </ul>
      )}
      <Pagination
        items={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      ></Pagination>
    </Fragment>
  );
}

export default App;
