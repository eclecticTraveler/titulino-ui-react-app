import React, { useMemo, useState } from "react";
import { Col, Row } from "antd";
import PropTypes from "prop-types";

const getOrderedCards = (cards = [], cardOrder = []) => {
  const cardMap = new Map(cards.map(card => [card.key, card]));
  const usedKeys = new Set();
  const orderedCards = [];

  cardOrder.forEach((cardKey) => {
    if (cardMap.has(cardKey) && !usedKeys.has(cardKey)) {
      orderedCards.push(cardMap.get(cardKey));
      usedKeys.add(cardKey);
    }
  });

  cards.forEach((card) => {
    if (!usedKeys.has(card.key)) {
      orderedCards.push(card);
    }
  });

  return orderedCards;
};

const moveCardOrderItem = (cardOrder = [], sourceKey, targetKey) => {
  if (!sourceKey || !targetKey || sourceKey === targetKey) {
    return cardOrder;
  }

  const nextOrder = [...cardOrder];
  const sourceIndex = nextOrder.indexOf(sourceKey);
  const targetIndex = nextOrder.indexOf(targetKey);

  if (sourceIndex < 0 || targetIndex < 0) {
    return cardOrder;
  }

  const [movedCardKey] = nextOrder.splice(sourceIndex, 1);
  nextOrder.splice(targetIndex, 0, movedCardKey);
  return nextOrder;
};

const DraggableDashboardGrid = ({
  cards,
  cardOrder,
  onCardOrderChange,
  gutter = [16, 16],
  colProps = { xs: 24, sm: 24, md: 24, lg: 8 }
}) => {
  const [draggedCardKey, setDraggedCardKey] = useState("");
  const [dragOverCardKey, setDragOverCardKey] = useState("");
  const orderedCards = useMemo(() => getOrderedCards(cards, cardOrder), [cards, cardOrder]);
  const currentCardOrder = orderedCards.map(card => card.key);

  const handleDragStart = (event, cardKey) => {
    setDraggedCardKey(cardKey);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", cardKey);
  };

  const handleDragOver = (event, cardKey) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverCardKey(cardKey);
  };

  const handleDrop = (event, targetCardKey) => {
    event.preventDefault();

    const sourceCardKey = event.dataTransfer.getData("text/plain") || draggedCardKey;
    setDraggedCardKey("");
    setDragOverCardKey("");

    if (!sourceCardKey || sourceCardKey === targetCardKey) {
      return;
    }

    const nextCardOrder = moveCardOrderItem(currentCardOrder, sourceCardKey, targetCardKey);
    onCardOrderChange(nextCardOrder);
  };

  const handleDragEnd = () => {
    setDraggedCardKey("");
    setDragOverCardKey("");
  };

  return (
    <Row gutter={gutter}>
      {orderedCards.map((card) => (
        <Col
          {...colProps}
          key={card.key}
          draggable
          onDragStart={(event) => handleDragStart(event, card.key)}
          onDragOver={(event) => handleDragOver(event, card.key)}
          onDragLeave={() => {
            if (dragOverCardKey === card.key) {
              setDragOverCardKey("");
            }
          }}
          onDrop={(event) => handleDrop(event, card.key)}
          onDragEnd={handleDragEnd}
          style={{
            cursor: draggedCardKey === card.key ? "grabbing" : "grab",
            opacity: draggedCardKey === card.key ? 0.72 : 1,
            transform: dragOverCardKey === card.key && draggedCardKey !== card.key ? "scale(0.99)" : "none",
            transition: "opacity 120ms ease, transform 120ms ease"
          }}
        >
          {card.content}
        </Col>
      ))}
    </Row>
  );
};

DraggableDashboardGrid.propTypes = {
  cards: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    content: PropTypes.node
  })).isRequired,
  cardOrder: PropTypes.arrayOf(PropTypes.string),
  onCardOrderChange: PropTypes.func.isRequired,
  gutter: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.array
  ]),
  colProps: PropTypes.object
};

export default DraggableDashboardGrid;
