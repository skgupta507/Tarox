'use client';

import { fetchWatchData } from '@/lib/ConsumetFunction';
import { useSearchParams } from 'next/navigation';
import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { toast } from 'react-toastify';

export const WatchAreaContext = createContext();

export function WatchAreaContextProvider({ children, AnimeInfo }) {
  const searchparam = useSearchParams()

  const [episode, setEpisode] = useState(parseInt(searchparam.get('ep')) || 1);
  const [watchInfo, setWatchInfo] = useState({ loading: true });
  const [isDub, setIsDub] = useState(false);
  const [episodes, setEpisodes] = useState("loading")

  let dub, sub;
  if (episodes !== "loading") {
    ({ dub, sub } = episodes);
  }
  useEffect(() => {
    if (episodes === "loading") return

    let isMounted = true;
    const fetchData = async () => {
      setWatchInfo((prev) => ({ ...prev, loading: true }));

      try {
        const selectedList = isDub ? dub : sub;
        const episodeData = findEpisodeData(selectedList, episode);
        if (!episodeData) {
          handleNoEpisodeFound(isMounted);
          return;
        }
        const watchData = await fetchWatchData(episodeData.id, AnimeInfo?.idMal, episodeData.number);
        console.log(watchData);

        if (isMounted) {
          setWatchInfo(
            {
              ...watchData,
              thumbnail: episodeData?.image,
              title: episodeData?.title,
              loading: false
            });
        }
      } catch (error) {
        handleError(error, isMounted);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [episode, dub, sub, isDub]);

  const findEpisodeData = (selectedList, episodeNumber) => {
    return selectedList?.find((item) => item.number === episodeNumber);
  };


  const handleNoEpisodeFound = () => {
    setWatchInfo({ loading: false });
    toast(`No ${isDub ? 'Dub' : 'Sub'} episode found`);
  };

  const handleError = (error, isMounted) => {
    console.error('Failed to fetch watch data:', error);
    if (isMounted) {
      setWatchInfo({ loading: false, error: 'Failed to fetch data' });
      toast('Failed to fetch data');
    }
  };

  const contextValue = useMemo(() => ({
    episode,
    watchInfo,
    setEpisode,
    setIsDub,
    isDub,
    setEpisodes,
    episodes,
    AnimeInfo,
    animeid: AnimeInfo?.id
  }), [episode, watchInfo, isDub, episodes, AnimeInfo]);

  return (
    <WatchAreaContext.Provider value={contextValue}>
      {children}
    </WatchAreaContext.Provider>
  );
}

export function useWatchContext() {
  return useContext(WatchAreaContext);
}