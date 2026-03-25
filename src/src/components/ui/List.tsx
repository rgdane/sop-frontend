import { List as ListAntd } from "antd";
import InfiniteScroll from "react-infinite-scroll-component";
import Avatar from "../ui/Avatar";

interface ListProps {
  items: any[];
  hasMore: boolean;
  onLoadMore: () => void;
  scrollId?: string;
}

export const List = ({
  items,
  hasMore,
  onLoadMore,
  scrollId = "scrollableList",
}: ListProps) => {
  return (
    <div
      id={scrollId}
      style={{
        maxHeight: 300,
        overflow: "auto",
        padding: "0 16px",
        borderRadius: 8,
      }}
    >
      <InfiniteScroll
        dataLength={items.length}
        next={onLoadMore}
        hasMore={hasMore}
        loader={<p>Memuat...</p>}
        scrollableTarget={scrollId}
      >
        <ListAntd
          dataSource={items}
          renderItem={(user: any) => (
            <ListAntd.Item key={user.email}>
              <ListAntd.Item.Meta
                avatar={
                  <Avatar style={{ backgroundColor: "#ff6757" }}>
                    {user.name?.charAt(0).toUpperCase() ?? "?"}
                  </Avatar>
                }
                title={<span className="font-medium">{user.name}</span>}
                description={user.email}
              />
            </ListAntd.Item>
          )}
        />
      </InfiniteScroll>
    </div>
  );
};
