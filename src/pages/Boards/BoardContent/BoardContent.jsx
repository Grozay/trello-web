import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sorts'
import { DndContext, useSensor, useSensors, MouseSensor, TouchSensor, DragOverlay, defaultDropAnimationSideEffects, closestCorners, pointerWithin, rectIntersection, getFirstCollision, closestCenter } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useState, useEffect, useCallback, useRef } from 'react'
import { cloneDeep } from 'lodash'

import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'

const ACCTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACCTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACCTIVE_DRAG_ITEM_TYPE_CARD'
}

const BoardContent = ({ board }) => {
  //Nếu dùng PointerSensor mặc định thì phải kết hợp thuộc tính css touch-action: none ở phần tử kéo thả
  //- nhưng còn bug
  // const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })

  // yêu cầu chuột di chuyển 10px thì mới kích hoạt even, fix trường hợp click bị gọi event
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })

  //Nhấn giữ 250ms và dung sai của cảm ứng 500px thì mới kích hoạt event
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 500 } })

  //Ưu tiên sử dụng kết hợp 2 loại sensors là mouse và touchh để trải nghiệm trên mobile tốt nhất ko bị bug
  // const sensors = useSensors(pointerSensor)
  const sensors = useSensors(mouseSensor, touchSensor)


  const [orderedColumns, setOrderedColumns] = useState([])

  //cùng một thời điểm  chỉ có một phần tử đang được kéo (column hoặc carđ)
  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState(null)

  //Điểm va chạm cuối cùng trước đó(xử lí thuật toán phát hiện va chạm)
  const lastOverId = useRef(null)


  useEffect(() => {
    setOrderedColumns(mapOrder(board?.columns, board?.columnOrderIds, '_id'))
  }, [board])

  //tìm column theo cardId
  const findColumnByCardId = (cardId) => {
    //đoạn này lưu ý, nên dùng c.cards thay vì c.cardOrderIds vì ở bước handleDragOver chúng ta sẽ làm dữ liệu cho card
    //hoàn chỉnh trước rồi mới tạo ra cardOrderIds mới
    return orderedColumns.find(column => column?.cards?.map(card => card._id).includes(cardId))
  }

  const moveCardBetweenDifferentColumns = (
    activeColumn,
    overColumn,
    activeDraggingCardId,
    activeDragingCardData,
    overCardId,
    active,
    over
  ) => {
    setOrderedColumns(prevColumn => {
      //tìm vị trí của card đang kéo trong column đích (nơi đang được kéo tới)
      const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId)

      //logic tính toán "cardIndex mới" (trên hoặc dưới overCard) lấy chuẩn từ code của thư viện - nhiều khi muốn từ chối hiểu
      let newCardIndex
      const isBelowOverItem = active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height

      const modifier = isBelowOverItem ? 1 : 0

      newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1

      //clone mảng orderedColumns cũ ra một cái mới để xử lí data rồi return - cập nhạp lại orderedColumnsState mới
      const nextColumns = cloneDeep(prevColumn)
      const nextActiveColumn = nextColumns.find(column => column._id === activeColumn?._id)
      const nextOverColumn = nextColumns.find(column => column._id === overColumn?._id)

      // console.log('modifier', modifier)
      // console.log('nextActiveColumn', nextActiveColumn)
      // console.log('nextOverColumn', nextOverColumn)


      //Column cũ
      if (nextActiveColumn) {
        //xóa cái card ở column active (có thể nói là column cũ , cái lúc mà kéo card ra khỏi để sang column khác)
        nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)
        //cập nhạp lại cardOrderIds mới
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
      }


      //Column mới
      if (nextOverColumn) {
        //kiểm tra xem card đang kéo nó tồn tại ở overcolumn chưa, nếu có thì chỉ cần xóa nó trước
        nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDragItemId)


        //phải cập nhập lại chuẩn dữ liệu columnId trong card sau khi kéo card giữa 2 column
        const rebuild_activeDragingCardData = {
          ...activeDragingCardData,
          columnId: overColumn?._id
        }

        //thêm cái card đang kéo vào overColumn theo vị trí index mới
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, rebuild_activeDragingCardData)
        //cập nhạp lại cardOrderIds mới
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
      }
      return nextColumns
    })
  }

  const handleDragStart = (event) => {
    // console.log('handleDragStart', event)
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACCTIVE_DRAG_ITEM_TYPE.CARD : ACCTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)

    if (event?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id))
    }
  }

  //trigger trong quá trình drag một phần tử
  const handleDragOver = (event) => {
    // console.log('handleDragOver', event)
    //Ko lm gì thêm nếu đang kéo column
    if (activeDragItemType === ACCTIVE_DRAG_ITEM_TYPE.COLUMN) return
    const { active, over } = event
    //active: là cái card đang được kéo
    //over: là cái card đang tương tác trên hoặc dưới so với cái card được kéo ở trên(chổ thả ra)
    //kiểm tra không tồn tại active hoặc over (kéo linh tinh ra ngoài thì return luôn tránh lỗi)
    if (!active || !over) return

    //activeDragingCardData: là cái card đang được kéo
    const { id: activeDraggingCardId, data: { current: activeDragingCardData } } = active
    //overCardData: là cái card đang tương tác trên hoặc dưới so với cái card được kéo ở trên
    const { id: overCardId } = over

    //Tìm 2 cái column theo cardId
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)

    //Nếu ko tồn tại cái column nào thì return
    if (!activeColumn || !overColumn) return

    if (activeColumn?._id !== overColumn?._id) {
      moveCardBetweenDifferentColumns(
        activeColumn,
        overColumn,
        activeDraggingCardId,
        activeDragingCardData,
        overCardId,
        active,
        over
      )
    }

  }

  //trigger khi kết thúc hành động kéo(drag) một phần tử => hành động thả (drop)
  const handleDragEnd = (event) => {
    // console.log('handleDragEnd', event)

    const { active, over } = event

    //kiểm tra không tồn tại active hoặc over (kéo linh tinh ra ngoài thì return luôn tránh lỗi)
    if (!active || !over) return

    //xử lí kéo thả card
    if (activeDragItemType === ACCTIVE_DRAG_ITEM_TYPE.CARD) {
      //activeDragingCardData: là cái card đang được kéo
      const { id: activeDraggingCardId, data: { current: activeDragingCardData } } = active
      //overCardData: là cái card đang tương tác trên hoặc dưới so với cái card được kéo ở trên
      const { id: overCardId } = over

      //Tìm 2 cái column theo cardId
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      //Nếu ko tồn tại cái column nào thì return
      if (!activeColumn || !overColumn) return

      //kiểm tra xem card đang kéo có thuộc column cũ không, nếu không thì chuyển sang column mới
      //không dùng activeColumn vì activeColumn đã bị cập nhạp lại khi kéo card sang column khác trong sự kiện handleDragOver rồi
      //đây là dragend nên dùng oldColumnWhenDraggingCard đó là tạo biên mới đẻ oke hơn
      if (oldColumnWhenDraggingCard?._id !== overColumn?._id) {
        // console.log('chuyển card sang column khác')
        moveCardBetweenDifferentColumns(
          oldColumnWhenDraggingCard,
          overColumn,
          activeDraggingCardId,
          activeDragingCardData,
          overCardId,
          active,
          over
        )
      } else {
        //kéo thả card trong cùng column

        //lấy vị trí cũ thừ thằng oldColumnWhenDraggingCard
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(card => card._id === activeDraggingCardId)
        //lấy vị trí mới từ thằng overColumn
        const newCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId)

        //dùng arraymove vì kéo card nó tương tự như logic trong kéo column trong một cái boardcontent
        const dndOrderedCards = arrayMove(oldColumnWhenDraggingCard?.cards, oldCardIndex, newCardIndex)

        setOrderedColumns(prevColumn => {
          const nextColumn = cloneDeep(prevColumn)

          //tìm tới column mà mình thả card
          const targetColumn = nextColumn.find(column => column._id === overColumn._id)
          //cập nhập 2 giá trị mới là card và cardOrderIds trong cái targetColumn
          targetColumn.cards = dndOrderedCards
          targetColumn.cardOrderIds = dndOrderedCards.map(card => card._id)


          return nextColumn
        })
      }
    }

    //xử lí kéo thả column
    if (activeDragItemType === ACCTIVE_DRAG_ITEM_TYPE.COLUMN) {
      if (active.id !== over.id) {
        //lấy vị trí cũ thừ thằng active
        const oldColumnIndex = orderedColumns.findIndex(c => c._id === active.id)
        //lấy vị trí mới từ thằng over
        const newColumnIndex = orderedColumns.findIndex(c => c._id === over.id)


        //dùng arrayMove của thằng dnd-kit để sắp xếp lại columns ban đầu
        //code của arrayMove ở đây https://github.com/clauderic/dnd-kit/blob/master/packages/sortable/src/utilities/arrayMove.ts
        const dndOrderedColumns = arrayMove(orderedColumns, oldColumnIndex, newColumnIndex)
        //2 cái console.log dữ liệu sau dùng để xử lí gọi api update lại cột
        // const dndColumnOrderIds = dndOrderedColumns.map(c => c._id)
        // console.log('dndOrderedColumns', dndOrderedColumns)
        // console.log('dndColumnOrderIds', dndColumnOrderIds)

        setOrderedColumns(dndOrderedColumns)
      }
    }


    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnWhenDraggingCard(null)
  }
  //Animation khi thả drop phần tử - test bằng cách kéo xong thả trực tiếp và nhìn phần giữ chổ Overlay

  const customDropAnimation = {
    sideEffect: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } })
  }

  //custom lại thuật toán va chạm
  //agrs = arguments = đối số tham số
  const collisionDetectionStrategy = useCallback((agrs) => {
    if (activeDragItemType === ACCTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return closestCorners({ ...agrs })
    }

    const pointerIntersections = pointerWithin({ ...agrs })
    //thuật toán phát hiện va chạm sẽ trả về một mảng giá trị ở đây
    const intersections = !!pointerIntersections?.length ?
      pointerIntersections :
      rectIntersection({ ...agrs })

    let overId = getFirstCollision(intersections, 'id')
    // console.log('overId', overId)
    //overid là khi chạm có có 2 cái là column và card, khi vừa chạm column thì overId là column, khi chạm card thì overId là card
    if (overId) {

      const checkColumn = orderedColumns.find(column => column._id === overId)
      //nếu check ra column thì xử lí ngay lúc đó để không ra bug khi chạm card ở column khác bị giật giật
      if (checkColumn) {
        // console.log('overId before', overId)
        overId = closestCenter({
          ...agrs,
          droppableContainers: agrs.droppableContainers.filter(container => {
            return (container.id !== overId) && (checkColumn?.cardOrderIds?.includes(container.id))
          })
        })[0]?.id
        // console.log('overId after', overId)
      }

      lastOverId.current = overId
      return [{ id: overId }]
    }
    //nếu overId là null thì trả về mảng rỗng (tránh bug crash trang web)
    return lastOverId.current ? [{ id: lastOverId.current }] : []

  }, [activeDragItemType])

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      sensors={sensors}
      //thuật toán va chạm (nếu ko có thì card với cover lớn sẽ không kéo qua column  được vì lúc này nó sẽ bị comflict  giữa card và column), chúng ta sẽ dùng closestCorners thay vì closestCenter
      //https://docs.dndkit.com/api-documentation/context-provider/collision-detection-algorithms
      // collisionDetection={closestCorners}
      collisionDetection={collisionDetectionStrategy}
    >
      <Box sx={{
        backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#24495e' : '#1976d2',
        width: '100%',
        height: (theme) => theme.trello.boardContentHeight,
        p: '10px 0'
      }}>
        <ListColumns columns={orderedColumns} />
        <DragOverlay dropAnimation={customDropAnimation}>
          {(!activeDragItemType) && null}
          {(activeDragItemType === ACCTIVE_DRAG_ITEM_TYPE.COLUMN) && <Column column={activeDragItemData} />}
          {(activeDragItemType === ACCTIVE_DRAG_ITEM_TYPE.CARD) && <Card card={activeDragItemData} />}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent