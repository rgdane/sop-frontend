import { List as ListAntd, ListProps as AntdListProps } from "antd";
import InfiniteScroll from "react-infinite-scroll-component";
import Avatar from "../ui/Avatar";

interface InfiniteScrollListProps {
  items: any[];
  hasMore: boolean;
  onLoadMore: () => void;
  scrollId?: string;
}

interface RegularListProps extends AntdListProps<any> {}

type ListProps = InfiniteScrollListProps | RegularListProps;

function isInfiniteScrollProps(
  props: ListProps
): props is InfiniteScrollListProps {
  return "items" in props && "hasMore" in props && "onLoadMore" in props;
}

function ListComponent(props: ListProps) {
  if (isInfiniteScrollProps(props)) {
    const { items, hasMore, onLoadMore, scrollId = "scrollableList" } = props;

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
  }

  return <ListAntd {...props} />;
}

ListComponent.Item = ListAntd.Item;
ListComponent.Item.Meta = ListAntd.Item.Meta;

export const List = ListComponent;
