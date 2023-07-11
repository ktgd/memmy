import React, { useMemo, useState } from "react";
import { ScrollView, Text, View, useTheme } from "native-base";
import { CommunityView } from "lemmy-js-client";
import useTraverse from "../../../hooks/traverse/useTraverse";
import LoadingView from "../../common/Loading/LoadingView";
import TraverseItem from "./components/TraverseItem";
import SearchBar from "../../common/Search/SearchBar";
import RefreshControl from "../../common/RefreshControl";

import { selectFavorites } from "../../../slices/favorites/favoritesSlice";
import { selectCurrentAccount } from "../../../slices/accounts/accountsSlice";
import { useAppSelector } from "../../../../store";
import { getCommunityFullName } from "../../../helpers/LemmyHelpers";

import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";

function TraverseScreen() {
  const theme = useTheme();
  const traverse = useTraverse();

  const [term, setTerm] = useState("");

  const currentAccount = useAppSelector(selectCurrentAccount);
  const favorites =
    useAppSelector(selectFavorites).favorites[
      `${currentAccount.username}@${currentAccount.instance}`
    ];

  const header = useMemo(
    () => <SearchBar query={term} setQuery={setTerm} autoFocus={false} />,
    [term]
  );

  const isFavorite = (community: CommunityView) => {
    const communityFullName = getCommunityFullName(community);
    return favorites ? communityFullName in favorites : false;
  };

  const item = (community: CommunityView) => {
    if (term && !community.community.name.includes(term)) return null;
    return (
      <TraverseItem
        community={community}
        isFavorite={favorites ? isFavorite(community) : false}
        key={community.community.id}
      />
    );
  };

  const renderItem = React.useCallback(
    ({ item }: ListRenderItemInfo< string | CommunityView>) => {
      // console.log(`Item: ${JSON.stringify(item)}`);
      if (typeof item === "object" ) {
        if (term && !item.community.name.includes(term)) return null;
        return (
          <TraverseItem
            community={item}
            isFavorite={favorites ? isFavorite(item) : false}
            key={item.community.id}
          />
        );
      } else {
        return <Text textAlign="center">{item.toString()}</Text>
      }
    },
    [favorites, traverse.subscriptions]
  );

  if (traverse.loading) {
    return <LoadingView />;
  }

  // const data = [
  //   favorites && Object.keys(favorites).length > 0 ? "Favorites" : "",
  //   ... favorites && Object.keys(favorites).length > 0 ? traverse.subscriptions.filter((c) => isFavorite(c)) : "",
  //   "Subscriptions",
  //   ...traverse.subscriptions,
  // ];

  return (
    <View
      flex={1}
      backgroundColor={theme.colors.app.bg}
    >
      {header}

      {traverse.subscriptions.length === 0 ? (
        <Text
          fontStyle="italic"
          textAlign="center"
          justifyContent="center"
          alignSelf="center"
        >
          You don&apos;t have any subscriptions.
        </Text>
      ) : (
        <FlashList
          data={[
            favorites && Object.keys(favorites).length > 0 ? "Favorites" : "",
            ... favorites && Object.keys(favorites).length > 0 ? traverse.subscriptions.filter((c) => isFavorite(c)) : "",
            "Subscriptions",
            ...traverse.subscriptions,
          ]}
          renderItem={renderItem}
          keyExtractor={(item: string | CommunityView): string => {
            if(typeof item === "object") {
              return item.community.id.toString()
            } else {
              return item
            }
          }
          }
        />
      )}
    </View>
    
    // <ScrollView
    //   flex={1}
    //   backgroundColor={theme.colors.app.bg}
    //   refreshControl={
    //     <RefreshControl
    //       refreshing={traverse.refreshing}
    //       onRefresh={() => traverse.doLoad(true)}
    //     />
    //   }
    //   keyboardShouldPersistTaps="handled"
    // >
    //   {header}

    //   {favorites && Object.keys(favorites).length > 0 && (
    //     <>
    //       <Text textAlign="center">Favorites</Text>
    //       {traverse.subscriptions
    //         .filter((c) => isFavorite(c))
    //         .map((c) => item(c))}
    //     </>
    //   )}
    //   <Text textAlign="center">Subscriptions</Text>
    //   {traverse.subscriptions.length === 0 ? (
    //     <Text
    //       fontStyle="italic"
    //       textAlign="center"
    //       justifyContent="center"
    //       alignSelf="center"
    //     >
    //       You don&apos;t have any subscriptions.
    //     </Text>
    //   ) : (
    //     traverse.subscriptions.map((c) => item(c))
    //   )}
    // </ScrollView>
  );
}

export default TraverseScreen;
