import React from 'react';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

const Pagination = ({ items, pageSize, onPageChange }) => {
  // Part 2 code goes here
  if (items.length <= 1) {
    return null;
  }
  let numPages = items.length / pageSize;
  console.log("numPages:", numPages);
  let pages = range(1, numPages);
  console.log("pages:", pages);
  let list = pages.map(page => {
      return (
        <Button key={page} className="page-item" onClick={onPageChange}>{page}</Button>
      );
  })
  return (
    <nav>
      <ul>{list}</ul>
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
      // Part 1, step 1 code goes here
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log(result.data)
        dispatch({ type: "FETCH_SUCCESS", something: result.data});
      }
      catch (err) {
        console.log("Error while fetching data:", err.message);
        dispatch({ type: "FETCH_ERROR" });
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
    case 'FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.something,
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

// App that gets data from Hacker News url
function App() {
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState('MIT');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    'https://hn.algolia.com/api/v1/search?query=MIT',
    {
      hits: [],
    }
  );
  const handlePageChange = (e) => {
    setCurrentPage(Number(e.target.textContent));
  };
  let page = data.hits;
  if (page.length >= 1) {
    page = paginate(page, currentPage, pageSize);
    console.log(`currentPage: ${currentPage}`);
  }
  return (
    <Fragment>
      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        // Part 1, step 2 code goes here
        <ul className="list-group">
          {page.map((item) => (
            <li key={item.objectID} className="list-group-item">
              <a href={item.url}>{item.title}</a>
            </li>
          ))}
        </ul>
      )}
      <Pagination
        items={data.hits}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      ></Pagination>
    </Fragment>
  );
}

export default App